import { FileHandle, open, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Papa from "papaparse";
import { config } from "@/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: config.api.model });

const COUPON_TRIGGER = config.coupons.trigger;
const COUPON_FILE_PATH = config.coupons.enabled
  ? path.join(process.cwd(), config.coupons.filePath)
  : null;
const COUPON_LOCK_PATH = COUPON_FILE_PATH ? `${COUPON_FILE_PATH}.lock` : null;

type CouponRecord = {
  codigo: string;
  estado?: string;
  asignado?: string;
  fechaUso?: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withCouponLock<T>(handler: () => Promise<T>): Promise<T> {
  if (!config.coupons.enabled || !COUPON_LOCK_PATH) {
    return handler();
  }

  let handle: FileHandle | null = null;
  const start = Date.now();

  while (!handle) {
    try {
      handle = await open(COUPON_LOCK_PATH, "wx");
    } catch (error: unknown) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError?.code !== "EEXIST") {
        throw error;
      }
      if (Date.now() - start > config.coupons.lockTimeout) {
        throw new Error(
          "No se pudo obtener acceso exclusivo al archivo de cupones.",
        );
      }
      await sleep(50);
    }
  }

  try {
    return await handler();
  } finally {
    await handle.close();
    await unlink(COUPON_LOCK_PATH).catch(() => {});
  }
}

async function readCoupons(): Promise<CouponRecord[]> {
  if (!config.coupons.enabled || !COUPON_FILE_PATH) {
    return [];
  }

  let csvContent: string;
  try {
    csvContent = await readFile(COUPON_FILE_PATH, "utf-8");
  } catch (error: unknown) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError?.code === "ENOENT") {
      throw new Error("No se encontro el archivo de cupones.");
    }
    throw error;
  }

  const parsed = Papa.parse<CouponRecord>(csvContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
    delimiter: config.wines.delimiter,
  });

  if (parsed.errors.length > 0) {
    throw new Error(
      `Error al parsear los cupones: ${parsed.errors[0].message}`,
    );
  }

  return parsed.data.filter((row) => row && row.codigo);
}

async function persistCoupons(coupons: CouponRecord[]) {
  if (!config.coupons.enabled || !COUPON_FILE_PATH) {
    return;
  }

  const csv = Papa.unparse(
    {
      fields: ["codigo", "estado", "asignado", "fechaUso"],
      data: coupons,
    },
    { delimiter: config.wines.delimiter },
  );

  await writeFile(COUPON_FILE_PATH, `${csv}\n`, "utf-8");
}

async function allocateCoupon(
  conversationId: string,
): Promise<CouponRecord | null> {
  return withCouponLock(async () => {
    const coupons = await readCoupons();
    const available = coupons.find((coupon) => {
      const status = (coupon.estado || "").toLowerCase();
      return status !== "usado";
    });

    if (!available) {
      return null;
    }

    available.estado = "usado";
    available.asignado = conversationId;
    available.fechaUso = new Date().toISOString();

    await persistCoupons(coupons);

    return { ...available };
  });
}

async function parseCSV(csvText: string) {
  const parseResult = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  const wines = parseResult.data as Record<string, string>[];

  return wines;
}

function generateInventoryText(wines: Record<string, string>[]) {
  let inventoryDescription = `La base de datos de ${config.business.name} contiene los siguientes vinos:\n\n`;

  wines.forEach((wine, index) => {
    const cols = config.wines.columns;
    const nombre = wine[cols.name] || "";
    const tipo = wine[cols.type] || "";
    const pais = wine[cols.country] || "";
    const tipoUva = wine[cols.grapeType] || "Sin especificar";
    const precio = wine[cols.price] || "";
    const gusto = wine[cols.taste] || "";
    const maridaje = wine[cols.pairing] || "";
    const combinaciones = wine[cols.combinations] || "";
    const tiendas = wine[cols.stores] || "";
    const imagen = wine[cols.image] || "";

    inventoryDescription += `${index + 1}. **${nombre}** - Tipo: ${tipo}, País: ${pais}, Tipo de uva: ${tipoUva}, Precio: ${precio}. Gusto: ${gusto}. Maridaje: ${maridaje}. Combinaciones sugeridas: ${combinaciones}. Disponibilidad: ${tiendas}. Imagen: ${imagen}\n\n`;
  });

  return inventoryDescription;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const conversationId =
      Array.isArray(messages) &&
      messages.length > 0 &&
      typeof messages[0]?.id === "string"
        ? String(messages[0].id)
        : `conv-${Date.now()}`;

    const csvResponse = await fetch(config.wines.csvUrl);
    if (!csvResponse.ok) {
      throw new Error("No se pudo descargar el CSV de inventario.");
    }

    const csvText = await csvResponse.text();
    const wines = await parseCSV(csvText);
    const inventario = generateInventoryText(wines);

    const systemPrompt = `
La IA debe actuar como un sommelier virtual llamado ${config.sommelier.name}. Eres el sommelier experto de ${config.business.name}.

${config.sommelier.name} responde usando SOLO la información de la base de datos proporcionada. NUNCA recomienda vinos fuera de esta base de datos ni inventa información.

Mantiene una personalidad ${config.sommelier.personality} y guia al cliente hasta elegir el vino ideal.

${config.sommelier.name} DEBE:
1. Saludar cordialmente y presentarse como el sommelier experto de ${config.business.name}.
2. Consultar sobre preferencias de gusto (fresco, dulce, seco, afrutado, suave, etc.).
3. Preguntar para qué ocasión se requiere el vino (cumpleaños, cita romántica, reunión con amigos, etc.).
4. Recomendar la mejor opción priorizando alternativas de mayor precio. Proporcionar: nombre del vino, tipo de uva, país, precio, maridaje sugerido.
5. Mostrar la foto en formato Markdown: ![Foto del vino](URL_de_imagen)
6. Preguntar si desea ver otras opciones. Si lo solicita, entregar dos alternativas adicionales con menor precio.
7. Informar disponibilidad y tiendas donde se puede adquirir.
8. Despedirse cordialmente agradeciendo al cliente.
9. RESTRICCIONES CRÍTICAS:
   - NO recomendar bebidas alcohólicas a menores de ${config.restrictions.minAge} años.
   ${config.restrictions.preventPregnant ? "- NO recomendar a mujeres embarazadas." : ""}
   - SOLO recomendar vinos de la base de datos de ${config.business.name}.
   - No recomendar competidores ni comercios externos.
10. ${config.coupons.enabled ? `Al final de la conversación, escribir en línea separada exactamente: ${COUPON_TRIGGER}` : ""}

Base de datos de ${config.business.name}:
${inventario}
`;

    let couponMessagePromise: Promise<string> | null = null;
    const resolveCouponMessage = () => {
      if (!couponMessagePromise) {
        couponMessagePromise = (async () => {
          try {
            const coupon = await allocateCoupon(conversationId);
            if (!coupon) {
              return `Lo siento, ya no quedan cupones disponibles por ahora. Mantente atento a futuras promociones de ${config.business.name}.`;
            }
            return `Aquí tienes tu cupón exclusivo: **${coupon.codigo}**. ¡Úsalo en tu próxima compra en ${config.business.name}!`;
          } catch (error) {
            console.error("Error asignando cupón:", error);
            return `No fue posible emitir un cupón en este momento. Por favor consulta con nuestro equipo en ${config.business.name}.`;
          }
        })();
      }
      return couponMessagePromise;
    };

    // Convertir mensajes al formato esperado por Gemini
    const conversationHistory = (messages ?? []).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const stream = new ReadableStream({
      async start(controller) {
        const emit = (text: string) => {
          if (text) {
            controller.enqueue(text);
          }
        };

        try {
          // Usar sendMessage con streaming - Gemini requiere formato diferente
          const response = await model.generateContentStream({
            contents: [
              {
                role: "user",
                parts: [
                  { text: systemPrompt + "\n\nEsta es la conversación:\n" },
                ],
              },
              ...conversationHistory,
            ],
            generationConfig: {
              temperature: 0.7,
              topP: 0.9,
              topK: 40,
            },
          });

          let buffer = "";
          let couponInserted = false;
          const tailLength =
            COUPON_TRIGGER.length > 1 ? COUPON_TRIGGER.length - 1 : 0;

          for await (const chunk of response.stream) {
            const text = chunk.text() || "";
            if (!text) {
              continue;
            }

            buffer += text;

            if (config.coupons.enabled && !couponInserted) {
              const triggerIndex = buffer.indexOf(COUPON_TRIGGER);
              if (triggerIndex !== -1) {
                const before = buffer.slice(0, triggerIndex);
                emit(before);

                const couponText = await resolveCouponMessage();
                emit(couponText);

                buffer = buffer.slice(triggerIndex + COUPON_TRIGGER.length);
                couponInserted = true;
              }
            }

            if (!config.coupons.enabled || couponInserted) {
              if (buffer) {
                emit(buffer);
                buffer = "";
              }
            } else {
              const safeLength = Math.max(0, buffer.length - tailLength);
              if (safeLength > 0) {
                const toEmit = buffer.slice(0, safeLength);
                emit(toEmit);
                buffer = buffer.slice(safeLength);
              }
            }
          }

          if (buffer) {
            emit(buffer);
          }

          controller.close();
        } catch (error) {
          console.error("Error en Gemini streaming:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error en solicitud:", error);
    return new Response(config.prompts.error, { status: 500 });
  }
}
