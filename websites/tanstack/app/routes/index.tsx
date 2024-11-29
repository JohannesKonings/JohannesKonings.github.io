// app/routes/index.tsx
import * as React from 'react'
import * as fs from 'node:fs'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/start'
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Typography,
  Link,
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTwitter,
  faGithub,
  faBluesky,
} from '@fortawesome/free-brands-svg-icons'

const filePath = 'count.txt'

async function readCount() {
  return parseInt(
    await fs.promises.readFile(filePath, 'utf-8').catch(() => '0'),
  )
}

const getCount = createServerFn({
  method: 'GET',
}).handler(() => {
  return readCount()
})

const updateCount = createServerFn({ method: 'POST' })
  .validator((d: number) => d)
  .handler(async ({ data }) => {
    const count = await readCount()
    await fs.promises.writeFile(filePath, `${count + data}`)
  })

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => await getCount(),
})
// const rootRoute = createRootRoute({
// });
// export const Route = createRoute({
// 	path: "/tanstack",
// 	component: Home,
// 	getParentRoute: () => rootRoute,
// });

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
})

function Home() {
  const router = useRouter()
  const state = Route.useLoaderData()

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container style={{ textAlign: 'center' }}>
        <img src="../../img/avatar.png" alt="Avatar" />
        <div>
          <Link
            href="https://github.com/johanneskonings"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            style={{ margin: '0 10px' }}
          >
            <FontAwesomeIcon icon={faGithub} size="2x" />
          </Link>
          <Link
            href="https://bsky.app/profile/johanneskonings.dev"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            style={{ margin: '0 10px' }}
          >
            <FontAwesomeIcon icon={faBluesky} size="2x" />
          </Link>
        </div>
        <Typography variant="h3" style={{ fontFamily: 'Cascadia Code' }}>
          Johannes Konings
        </Typography>
      </Container>
    </ThemeProvider>
  )
}
