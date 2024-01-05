import Image from 'next/image';
import { useRouter } from 'next/router'
import React from 'react';
import { useEffect, useState } from 'react';

export default function Search() {

    const {
        basePath
    } = useRouter();

    return (
        <>
            <h1 className="mt-auto">Search</h1>
        </>
    );
}