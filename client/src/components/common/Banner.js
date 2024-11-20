import React, { memo } from "react"
import banner from '../../assets/bannerHome.jpg'

const Banner = () => {
  return (
    <div className="w-full">
      <img
        src={banner}
        alt="banner"
        className="md:h-[400px] w-full md:object-cover object-contain"
      />
    </div>
  )
}

export default memo(Banner)
