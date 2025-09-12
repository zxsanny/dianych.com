import Image from 'next/image';

interface OrderButtonProps {
    orderText: string;
    orderLink: string;
}

const OrderButton = ({ orderText, orderLink }: OrderButtonProps) => {
    return (
        <a
            href={orderLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-red text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-700 transition-colors duration-300 text-lg shadow-lg group"
        >
            <span>{orderText}</span>
            <div className="relative w-6 h-6 ml-3 transform transition-transform duration-300 group-hover:translate-x-1">
                <Image
                    src="/images/insta_send.svg"
                    alt="Order icon"
                    fill
                    className="object-contain"
                />
            </div>
        </a>
    );
};

export default OrderButton;