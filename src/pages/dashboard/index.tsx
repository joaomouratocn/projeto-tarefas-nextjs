import { GetServerSideProps } from "next"
import { ChangeEvent, FormEvent, use, useState } from "react";
import { getSession } from "next-auth/react";
import { TextArea } from "@/components/textarea";
import { FiShare2 } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import { db } from "../../services/firebaseConnection"
import { addDoc, collection, query, orderBy, where, onSnapshot, doc, deleteDoc } from "firebase/firestore"
import { useEffect } from "react";
import styles from "./styles.module.css"
import Head from "next/head"
import Link from "next/link";

interface UserProps {
    user: {
        email: string
    }
}

interface TasksProps {
    id: string
    created: Date
    public: boolean
    task: string
    user: string
}

export default function Dashboard({ user }: UserProps) {
    const [input, setInput] = useState('');
    const [publicTask, setPublicTask] = useState(false)
    const [tasks, setTasks] = useState<TasksProps[]>([])

    useEffect(() => {
        async function loadTasks() {
            const taskRef = collection(db, 'tasks')
            const q = query(
                taskRef,
                orderBy('created', 'desc'),
                where('user', '==', user?.email)
            )

            onSnapshot(q, (snapshot) => {
                let taskList = [] as TasksProps[];

                snapshot.forEach((doc) => {
                    taskList.push({
                        id: doc.id,
                        task: doc.data().task,
                        created: doc.data().created,
                        user: doc.data().user,
                        public: doc.data().public
                    })
                })

                setTasks(taskList);
            });
        }

        loadTasks()
    }, [user?.email])

    function handlePublic(event: ChangeEvent<HTMLInputElement>) {
        setPublicTask(event.target.checked)
    }

    async function handleShare(taskId: string) {
        await navigator.clipboard.writeText(`
            ${process.env.NEXT_PUBLIC_URL}/task/${taskId}
        `)
        alert('URL COPIADA COM SUCESSO!')
    }

    async function handleSaveTask(event: FormEvent) {
        event.preventDefault();
        if (input === '') { return; }
        try {
            await addDoc(collection(db, 'tasks'), {
                task: input,
                created: new Date(),
                user: user?.email,
                public: publicTask
            })

            setInput('')
            setPublicTask(false)
        } catch (error) {
            console.log(error)
        }
    }

    async function handleDeleteTask(id: string) {
        const docRef = doc(db, 'tasks', id)
        await deleteDoc(docRef)
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Painel de Controle</title>
            </Head>
            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}>Qual sua tarefa?</h1>
                        <form onSubmit={handleSaveTask}>
                            <TextArea
                                placeholder="Digite sua tarefa"
                                value={input}
                                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                                    setInput(event.target.value)
                                } />
                            <div className={styles.checkboxArea}>
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={publicTask}
                                    onChange={(event) => { handlePublic(event) }}
                                />
                                <label>Deixar tarefa publica</label>
                            </div>
                            <button type="submit" className={styles.button}>Salvar</button>
                        </form>
                    </div>
                </section>
                <section className={styles.taskContainer}>
                    <h1>Minhas tarefas</h1>
                    {tasks.map((task) => (
                        <article key={task.id} className={styles.task}>
                            {task.public && (
                                <div className={styles.tagContainer}>
                                    <label className={styles.tag}>público</label>
                                    <button className={styles.shareButton} onClick={() => handleShare(task.id)}>
                                        <FiShare2 size={22} color="#3183ff" />
                                    </button>
                                </div>
                            )}
                            <div className={styles.taskContent}>
                                {task.public ? (
                                    <Link href={`/task/${task.id}`}>
                                        <p>{task.task}</p>
                                    </Link>
                                ) : (
                                    <p>{task.task}</p>
                                )}
                                <button className={styles.buttonTrash} onClick={() => handleDeleteTask(task.id)}>
                                    <FaTrash
                                        size={24}
                                        color="#EA3140" />
                                </button>
                            </div>
                        </article>
                    ))}
                </section>
            </main>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    console.log('Buscando dados usuário no server side');
    const session = await getSession({ req })
    console.log(session)
    if (!session?.user) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            },
        }
    }

    return {
        props: {
            user: {
                email: session.user?.email
            }
        },
    };
}