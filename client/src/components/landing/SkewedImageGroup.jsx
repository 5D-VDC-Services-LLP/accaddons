import React from 'react';
import img1 from '../../assets/Hero1.svg';
import img2 from '../../assets/Hero2.svg';
import img3 from '../../assets/Hero3.svg';
import { motion } from 'framer-motion';

const SkewedImageGroup = () => {
    // Final offset positions
    const imageFinalPositions = [
        { x: 0, y: 0 },
        { x: 150, y: 15 },
        { x: 350, y: 50 },
    ];

    // Initial offset (top-right of final position)
    const getInitial = (finalX, finalY) => ({
        x: finalX + 50,
        y: finalY - 50,
        opacity: 0,
    });

    const skewStyle = {
        rotate: -6,
        skewX: 20,
        skewY: -5,
        rotateX: -10,
        rotateY: -10,
    };

    return (
        <div className="relative w-full lg:w-[1000px] h-[500px] flex items-center justify-center perspective-[1000px]">

            {[img1, img2, img3].map((img, idx) => (
                <motion.img
                    key={idx}
                    src={img}
                    alt={`Skewed ${idx + 1}`}
                    className={`absolute w-[90%] origin-bottom-left z-20 ${
                        idx === 2
                            ? `[mask-image:linear-gradient(to_bottom,black_85%,transparent_100%),linear-gradient(to_right,black_85%,transparent_100%)]
                               [mask-composite:intersect]`
                            : `[mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]`
                    } [mask-size:100%_100%] [mask-repeat:no-repeat] [mask-position:center]`}
                    initial={getInitial(imageFinalPositions[idx].x, imageFinalPositions[idx].y)}
                    animate={{ x: imageFinalPositions[idx].x, y: imageFinalPositions[idx].y, opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.3 + idx * 0.4, ease: "easeOut" }}
                    style={skewStyle}
                />
            ))}
        </div>
    );
};

export default SkewedImageGroup;
