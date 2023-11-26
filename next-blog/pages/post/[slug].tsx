import fs from 'fs';
import matter from 'gray-matter';
import md from 'markdown-it';
import React from 'react';

export async function getStaticPaths() {
  // const files = fs.readdirSync('posts');
  const files = fs.readdirSync('../_posts');
  const paths = files.map((fileName) => ({
    params: {
      slug: fileName.replace('.md', ''),
    },
  }));
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params: { slug } }: { params: { slug: string } }) {
  // const fileName = fs.readFileSync(`posts/${slug}.md`, 'utf-8');
  const fileName = fs.readFileSync(`../_posts/${slug}.md`, 'utf-8');
  const { data: frontmatter, content } = matter(fileName);
  return {
    props: {
      frontmatter,
      content,
    },
  };
}

export default function PostPage({ frontmatter, content }: { frontmatter: any, content: any }) {
  return (
    <div key='postPage' className='prose mx-auto'>
      <h1>{frontmatter.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: md().render(content) }} />
    </div>
  );
}