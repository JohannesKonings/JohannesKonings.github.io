import Image from 'next/image';
import { useRouter } from 'next/router'
import React from 'react';
import { useEffect, useState } from 'react';

export default function Personal() {

  const {
    basePath
  } = useRouter();

  const [animationClass, setAnimationClass] = useState('animate-pulse');

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationClass('');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div key='personal' className={`relative flex flex-col items-center justify-center bg-gradient-to-r from-gray-200 to-gray-300 min-h-[350px] ${animationClass}`}>
        <Image
          className="absolute top-[-20%]"
          src={`${basePath}/images/avartar.png`}
          alt="Avatar"
          width={150}
          height={150}
        />
        <h1 className="mt-auto">Johannes Konings</h1>
      </div>
    </>
  );
}