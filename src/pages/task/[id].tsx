import { ChangeEvent, FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import styles from "./styles.module.css"
import { TextArea } from "../../components/textarea/index";
import { GetServerSideProps } from "next";
import { db } from '../../services/firebaseConnection'
import { doc, collection, query, where, getDoc, addDoc, getDocs, deleteDoc } from 'firebase/firestore'
import { FaTrash } from 'react-icons/fa'

interface TasksProps {
    task: {
        taskId: string,
        desc: string,
        public: boolean,
        user: string,
        created: string
    };

    allComments: CommentProps[]
}

interface CommentProps {
    id: string,
    taskId: string,
    comment: string,
    user: string,
    userName: string
}

export default function Task({ task, allComments }: TasksProps) {
    const [input, setInput] = useState('');
    const [comments, setComments] = useState<CommentProps[]>(allComments || [])
    const { data: session } = useSession();

    async function handleComment(event: FormEvent) {
        event.preventDefault();
        if (input === '') return;

        if (!session?.user?.email || !session?.user?.name) return;

        try {
            const docRef = await addDoc(collection(db, 'comments'), {
                comment: input,
                created: new Date(),
                user: session?.user?.email,
                userName: session?.user?.name,
                taskId: task?.taskId
            })
            const newData = {
                id: docRef.id,
                comment: input,
                user: session.user?.email,
                userName: session.user.name,
                taskId: task.taskId
            }

            setComments((oldItems) => [...oldItems, newData])

            setInput('')
        } catch (error) {
            console.log(error)
        }
    }

    async function handleDeleteComment(commentId: string) {
        try {
            const docRef = doc(db, 'comments', commentId)
            await deleteDoc(docRef)
            const listUpdated = comments.filter((comment) => comment.id !== commentId)

            setComments(listUpdated)
            alert('Deletado com sucesso!')
        } catch (error) {
            console.log(error)
        }

    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Detalhes da tarefa</title>
            </Head>
            <main className={styles.main}>
                <h1>Detalhes da tarefa</h1>
                <article className={styles.task}>
                    <p>{task?.desc}</p>
                </article>
            </main>
            <section className={styles.commentsContiner}>
                <h2>Deixe seu comentário</h2>
                <form onSubmit={handleComment}>
                    <TextArea
                        placeholder="Digite seu comentário"
                        value={input}
                        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)} />
                    <button
                        disabled={!session?.user}
                        className={styles.button}
                    >Comentar</button>
                </form>
            </section>
            <section className={styles.commentsContiner}>
                <h2>Todos Comentários</h2>
                {comments.length === 0 && (
                    <span>Seja o primeiro a comentar</span>
                )}
                {
                    comments.map((item) => (
                        <article className={styles.comment} key={item.id}>
                            <div className={styles.headComment}>
                                <label className={styles.commentLabel}>{item.userName}</label>
                                {
                                    item.user === session?.user?.email &&

                                    (
                                        <button className={styles.buttonTrash} onClick={() => handleDeleteComment(item.id)}>
                                            <FaTrash size={18} color="#EA3140" />
                                        </button>
                                    )
                                }
                            </div>
                            <p>{item.comment}</p>
                        </article>
                    ))
                }
            </section>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const id = params?.id as string
    const docRef = doc(db, 'tasks', id)
    const snapshot = await getDoc(docRef)

    const q = query(collection(db, 'comments'), where('taskId', '==', id))
    const snapshotComments = await getDocs(q);

    let allComments: CommentProps[] = []

    snapshotComments.forEach((comment) => {
        allComments.push({
            id: comment.id,
            taskId: comment.data().taskId,
            user: comment.data().user,
            comment: comment.data().comment,
            userName: comment.data().userName
        })
    })

    if (snapshot.data === undefined) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }

    if (!snapshot.data()?.public) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }

    const milisenconds = snapshot.data()?.created?.seconds * 1000

    const seletedTask = {
        taskId: id,
        desc: snapshot.data()?.task,
        public: snapshot.data()?.public,
        user: snapshot.data()?.user,
        created: new Date(milisenconds).toLocaleDateString()
    }

    return {
        props: {
            task: seletedTask,
            allComments: allComments
        }
    }
}