import Head from "next/head";
import Image from "next/image";
import styles from "../styles/home.module.css"
import heroImage from "../../public/assets/hero.png"

export default function Home() {
  return (
    <div className={styles.container}>
      < Head > Task App</Head >
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
            <span>+12 posts</span>
          </section>

          <section className={styles.box}>
            <span>+90 comentários</span>
          </section>
        </div>
      </main>
    </div >
  )
}
