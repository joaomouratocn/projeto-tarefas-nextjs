import { GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/home.module.css"
import heroImage from "../../public/assets/hero.png"
import { db } from '../services/firebaseConnection'
import { collection, getDocs } from 'firebase/firestore'

interface HomeProps {
  posts: number;
  comments: number
}

export default function Home({ posts, comments }: HomeProps) {
  return (
    <div className={styles.container}>
      < Head ><title>Tarefas</title></Head >
      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image
            className={styles.hero}
            src={heroImage}
            alt="Logo Task"
            priority />
        </div>

        <h1 className={styles.title}>sistema feito para você organizar <br /> seus estudos e tarefas</h1>

        <div className={styles.infoContent}>
          <section className={styles.box}>
            <span>+ {posts} posts</span>
          </section>

          <section className={styles.box}>
            <span>+ {comments} comentários</span>
          </section>
        </div>
      </main>
    </div >
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const commentRef = collection(db, 'comments')
  const tasksRef = collection(db, 'tasks')

  const commentSnapShot = await getDocs(commentRef)
  const taskSnapShot = await getDocs(tasksRef)


  return {
    props: {
      posts: taskSnapShot.size || 0,
      comments: commentSnapShot.size || 0
    },
    revalidate: 60
  }
}
