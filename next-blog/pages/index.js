import fs from 'fs';
import matter from 'gray-matter';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router'

export async function getStaticProps() {

  const files = fs.readdirSync('posts');

  const posts = files.map((fileName) => {
    const slug = fileName.replace('.md', '');
    const readFile = fs.readFileSync(`posts/${fileName}`, 'utf-8');
    const { data: frontmatter } = matter(readFile);
    return {
      slug,
      frontmatter,
    };
  });

  return {
    props: {
      posts,
    },
  };
}

export default function Home({ posts }) {

  const {
    basePath
  } = useRouter();

  return (
    <div key='home-div' className='flex flex-col items-center justify-center p-4 md:p-0'>
      {posts.map(({ slug, frontmatter }) => (
        <>
          <div
            key={slug}
            className='flex flex-col max-w-md border border-gray-200 m-2 rounded-xl shadow-lg overflow-hidden'
          >
            <Link href={`/post/${slug}`}>
              <Image
                width={650}
                height={340}
                alt={frontmatter.title}
                src={`${basePath}/${frontmatter.socialImage}`}
              />
              <p className='p-4 text-center'>{frontmatter.date}</p>
              <h1 className='p-4 text-center'>{frontmatter.title}</h1>
            </Link>
          </div>
        </>
      ))}
    </div>
  );
}