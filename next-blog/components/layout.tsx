import Link from 'next/link';
import { useRouter } from 'next/router'

import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {

  const {
    basePath
  } = useRouter();

  return (
    <>
      <div key='layout' className='flex flex-col min-h-screen'>
        <header className='bg-fuchsia-100 mb-8 py-4'>
          <div className='container mx-auto flex justify-center'>
            <Link href='/'>
              🏡
            </Link>
            <span className='mx-auto'>Welcome to my blog</span>{' '}
          </div>
        </header>
        <main className='container mx-auto flex-1'>
          <div>{children}</div>
        </main>
        <footer className='bg-fuchsia-100 mt-8 py-4'>
          <div className='container mx-auto flex justify-center'>
            <a href={`${basePath}/impressum`}>Impressum</a>
          </div>
          <div className='container mx-auto flex justify-center'>
            &lt;/&gt; on <a href="https://github.com/JohannesKonings/JohannesKonings.github.io">Github</a> &nbsp;<i className="fa fa-github-alt"></i>
          </div>
        </footer>
      </div>
    </>
  );
}