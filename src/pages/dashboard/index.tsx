import { GetServerSideProps } from "next"
import { getSession } from "next-auth/react";
import { redirect } from "next/dist/server/api-utils";
import Head from "next/head"

export default function Dashboard() {

    return (
        <div>
            <Head>
                <title>Painel de Controle</title>
            </Head>
            <h1>Dashboard</h1>
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
        props: {},
    };
}