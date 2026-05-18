"use client";

import Image from "next/image";
import Link from "next/link";
import Chat from "./components/Chat";
import { config } from "@/config";

export default function Home() {
  const primaryColor = config.ui.primary;
  const secondaryColor = config.ui.secondary;

  return (
    <main className="flex flex-col h-screen overflow-hidden text-white" style={{backgroundColor: config.ui.background}}>
      <nav className="flex justify-between items-center p-4 border-b" style={{
        position: 'fixed',
        backgroundColor: config.ui.background,
        width: '100%',
        justifyContent: 'space-between',
        zIndex: '100',
        borderColor: 'rgba(128, 128, 128, 0.3)'
      }}>
        <Link href={config.business.website} passHref>
          <Image
            src={config.images.companyLogo}
            alt={`${config.business.name} Logo`}
            width={150}
            height={40}
            className="logo-company"
            style={{ cursor: 'pointer' }}
          />
        </Link>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '10px'}}>
          <h1 className="text-xl font-semibold title-responsive" style={{color: primaryColor}}>
            Habla con <span style={{color: secondaryColor}}>{config.sommelier.name}</span>
          </h1>
          <Image
            alt="sommelier avatar"
            width={50}
            height={50}
            src={config.images.sommelierAvatar}
          />
        </div>
      </nav>
      <div className="flex-grow overflow-hidden flex justify-center items-center">
        <Chat />
      </div>
    </main>
  );
}
