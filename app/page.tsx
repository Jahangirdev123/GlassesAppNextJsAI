
"use client"

import { useState } from "react"
import VirtualTryOn from "./components/VirtualTryOn"
// const products = [
//   {
//     name: "Sienna Straw",
//     price: "20.50 USD",
//     img: "https://pngimg.com/uploads/sunglasses/sunglasses_PNG18.png"
//   },
//   {
//     name: "Nova Beanie",
//     price: "55.00 USD",
//     img: "https://pngimg.com/uploads/sunglasses/sunglasses_PNG155.png"
//   },
//   {
//     name: "Nova Raw",
//     price: "32.00 USD",
//     img: "https://pngimg.com/uploads/sunglasses/sunglasses_PNG157.png"
//   },
// ]
// 
// /glasses-sienna.svg
const products = [
  { name: "Sienna Straw", price: "20.50 USD", img: "/629150.svg" },
  { name: "Nova Beanie", price: "55.00 USD", img: "/glasses-nova.svg" },
  { name: "Nova Raw", price: "32.00 USD", img: "/glasses-raw.svg" },
]

export default function Page() {
  const [glass, setGlass] = useState(products[0].img)
  const [cam, setCam] = useState(true)

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <nav className="flex items-center justify-between p-6">
        <b className="text-xs tracking-[0.22em]">👓 EYE CARE</b>
        <button
          onClick={() => setCam((value) => !value)}
          className={`${cam ? "bg-red-500 text-white" : "bg-black text-white"} rounded-full px-4 py-2 text-[11px] font-semibold tracking-wide`}
        >
          {cam ? "Close Camera" : "Try On Live"}
        </button>
      </nav>

      <div className="px-4 pb-6">
        <div className="relative min-h-[600px] overflow-hidden rounded-[32px] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:flex">
          <div className="h-[500px] bg-gray-100 md:w-1/2">
            {cam ? (
              <VirtualTryOn glassesImg={glass} />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=800"
                alt="Model preview"
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <div className="flex flex-col justify-center p-6 md:w-1/2 md:p-10">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-gray-500">AR style lab</p>
            <h1 className="mt-4 text-5xl font-black leading-none md:text-6xl">
              EYE COMFORT
              <br />
              EVERYONE
            </h1>
            <p className="mt-4 max-w-md text-sm text-gray-500">
              Click a frame below to preview it live with the face tracking camera.
            </p>
          </div>

          <div className="absolute bottom-6 left-4 flex gap-3 md:left-[25%]">
            {products.map((product, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setGlass(product.img)
                  setCam(true)
                }}
                className={`w-[110px] rounded-xl border-2 bg-white p-2 shadow-xl transition ${
                  glass === product.img ? "border-black" : "border-transparent"
                }`}
              >
                <img src={product.img} alt={product.name} className="mx-auto h-10 object-contain" />
                <p className="mt-1 text-center text-[11px] font-bold">{product.price}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
