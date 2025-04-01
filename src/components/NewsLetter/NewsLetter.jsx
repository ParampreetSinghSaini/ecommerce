import React from 'react'
import './newsLetter.css'

function NewsLetter() {
  return (
    <div className='newsletter'>
        <h1>Get Exclusive offers on your email</h1>
        <p>subscibe to our newletter and stay update</p>
        <div>
            <input type="email" placeholder='your email id' />
            <button>Subscibe</button>
        </div>
    </div>
  )
}

export default NewsLetter