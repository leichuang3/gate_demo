import React from 'react'
import { useRouter } from "next/router"
export default function Home() {
    const router = useRouter();
    const jumpPage = () => {
        router.push("/trade/BTC_USDT")
    }
    return (
        <div>首页 <button onClick={jumpPage}>点击跳转</button></div>
    )
}
