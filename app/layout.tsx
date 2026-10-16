import type { Metadata } from 'next'
// @ts-ignore Next.js handles this side-effect stylesheet import.
import './globals.css'

export const metadata: Metadata = {
  title: "Dude, She's Just Not Into You",
  description: 'A courtroom-style reality check for your questionable romantic decisions. Stop asking your boys. Present your case.',
  openGraph: {
    title: "Dude, She's Just Not Into You",
    description: 'A brutally unserious dating-signal quiz. Stop asking your boys. Present your case.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Dude, She's Just Not Into You",
    description: 'The internet court is now in session. Present your case.',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
