import styles from './page.module.css'
import {getVideos} from './firebase/functions'
import Link from 'next/link';
import Image from 'next/image';

export default async function Home() {
  const videos = await getVideos();
  // const thumbnailPrefix = 'https://storage.googleapis.com/whwj-yt-clone-thumbnails/';

  return (
    <main className={styles.main}>
      {
        videos.map((video) => (
          <Link href={`watch?v=${video.filename}`}>
            <Image src="" alt='video' width={120} height={80}
              className={styles.thumbnail}/>
          </Link>
        ))
      }
    </main>
  )
}
