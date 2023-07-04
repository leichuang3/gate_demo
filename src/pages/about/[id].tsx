// export async function getStaticProps() {
//     const result = await new Promise((resolve) => {
//         setTimeout(() => {
//             resolve("xxxxxxxx")
//         }, 1000);
//     })
//     return {props: {result}};
// }
import React from 'react';
import { useRouter } from "next/router"
export default function About (){
    const router = useRouter();

    console.log(router)
    return (
        <>
            <div>关于页面</div>
        </>
    )
}