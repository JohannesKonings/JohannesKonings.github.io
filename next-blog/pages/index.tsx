import fs from 'fs';
import matter from 'gray-matter';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router'
import Personal from '../components/personal';
import React from 'react';

export async function getStaticProps() {

  // const files = fs.readdirSync('posts');
  const files = fs.readdirSync('../_posts');

  const posts = files.map((fileName) => {
    const slug = fileName.replace('.md', '');
    // const readFile = fs.readFileSync(`posts/${fileName}`, 'utf-8');
    const readFile = fs.readFileSync(`../_posts/${fileName}`, 'utf-8');
    const { data: frontmatter } = matter(readFile);
    const date = frontmatter.date;
    return {
      slug,
      frontmatter,
      date,
    };
  });
  posts.sort((a, b) => {
    return new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime();
  });
  // convert date to local date without time -> format dd.mm.yyyy
  posts.forEach((post) => {
    post.date = new Date(post.date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  });

  return {
    props: {
      posts,
    },
  };
}

export default function Home({ posts }: { posts: any }) {

  const {
    basePath
  } = useRouter();

  return (
    <>
      <Personal />
      <div key='home-div' className='flex flex-col items-center justify-center p-4 md:p-0'>
        {posts.map(({ slug, frontmatter, date }: { slug: any, frontmatter: any, date: any }) => (
          <React.Fragment key={slug}>
            <div className='flex flex-col max-w-md border border-gray-200 m-2 rounded-xl shadow-lg overflow-hidden'             >
              <Link href={`/post/${slug}`}>
                <Image
                  width={650}
                  height={340}
                  alt={frontmatter.title}
                  src={`${basePath}/${frontmatter.socialImage}`}
                />
                {/* date without time */}
                <p className='p-4 text-center'>{date}</p>
                {/* <p className='p-4 text-center'>{frontmatter.date}</p> */}
                <h1 className='p-4 text-center'>{frontmatter.title}</h1>
              </Link>
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}