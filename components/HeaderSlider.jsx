import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

const HeaderSlider = () => {
  const { router } = useAppContext();

  const handleCategoryNavigation = (category) => {
    router.push(`/all-products?category=${encodeURIComponent(category)}`);
  };

  const handleSearchNavigation = (searchTerm) => {
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  const sliderData = [
    {
      id: 1,
      title: "Experience Pure Sound - Your Perfect Headphones Awaits!",
      offer: "Limited Time Offer 30% Off",
      buttonText1: "Buy now",
      buttonText2: "Find more",
      imgSrc: assets.header_headphone_image,
      button1Action: () => handleSearchNavigation('headphones'),
      button2Action: () => handleCategoryNavigation('audio'),
    },
    {
      id: 2,
      title: "Next-Level Gaming Starts Here - Discover PlayStation 5 Today!",
      offer: "Hurry up only few lefts!",
      buttonText1: "Shop Now",
      buttonText2: "Explore Deals",
      imgSrc: assets.header_playstation_image,
      button1Action: () => handleSearchNavigation('playstation'),
      button2Action: () => handleCategoryNavigation('gaming'),
    },
    {
      id: 3,
      title: "Power Meets Elegance - Apple MacBook Pro is Here for you!",
      offer: "Exclusive Deal 40% Off",
      buttonText1: "Order Now",
      buttonText2: "Learn More",
      imgSrc: assets.header_macbook_image,
      button1Action: () => handleSearchNavigation('macbook'),
      button2Action: () => handleCategoryNavigation('laptops'),
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [sliderData.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="overflow-hidden relative w-full">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {sliderData.map((slide, index) => (
          <div
            key={slide.id}
            className="flex flex-col-reverse md:flex-row items-center justify-between bg-gradient-to-br from-[#E6E9F2] via-[#F0F3FF] to-[#E6E9F2] dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 py-8 md:px-14 px-5 mt-6 rounded-xl min-w-full border border-gray-200/50 dark:border-gray-700/50 shadow-lg dark:shadow-gray-900/50"
          >
            <div className="md:pl-8 mt-10 md:mt-0">
              <p className="md:text-base text-orange-600 dark:text-orange-400 pb-1 font-medium">{slide.offer}</p>
              <h1 className="max-w-lg md:text-[40px] md:leading-[48px] text-2xl font-bold text-gray-900 dark:text-white">
                {slide.title}
              </h1>
              <div className="flex items-center mt-4 md:mt-6 ">
                <button 
                  onClick={slide.button1Action}
                  className="btn-primary md:px-10 px-7 rounded-full font-semibold shadow-lg hover:shadow-xl dark:shadow-gray-900/50 transform hover:scale-105 transition-all duration-300"
                >
                  {slide.buttonText1}
                </button>
                <button 
                  onClick={slide.button2Action}
                  className="group flex items-center gap-2 px-6 py-2.5 font-medium text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 transition"
                >
                  {slide.buttonText2}
                  <Image className="group-hover:translate-x-1 transition dark:brightness-200" src={assets.arrow_icon} alt="arrow_icon" />
                </button>
              </div>
            </div>
            <div className="flex items-center flex-1 justify-center">
              <Image
                className="md:w-72 w-48"
                src={slide.imgSrc}
                alt={`Slide ${index + 1}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-8">
        {sliderData.map((_, index) => (
          <div
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`h-2 w-2 rounded-full cursor-pointer transition-colors duration-300 ${
              currentSlide === index ? "bg-orange-600 dark:bg-orange-500" : "bg-gray-400/50 dark:bg-gray-600/50"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default HeaderSlider;
