import React from 'react'
import './breadCrums.css'
import arrow_icon from '../../assets/breadcrum_arrow.png'

function BreadCrums(props) {
    const{product}=props;

  return (
    <div className='breadcrum'>
        HOME <img src={arrow_icon} alt="" /> SHOP <img src={arrow_icon} alt="" /> {product.name} <img src={arrow_icon} alt="" /> {product.category}

    </div>
  )
}

export default BreadCrums