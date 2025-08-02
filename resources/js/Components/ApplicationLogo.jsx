export default function ApplicationLogo({ size = "40" }) {
    return (
        <div className="flex justify-center">
            <img 
                src="https://www.sparkingasia.com/wp-content/uploads/2022/03/sa.png" 
                className={`w-${size} h-${size} object-contain filter drop-shadow-lg`} 
                alt="Sparking Asia Logo"
            />
        </div>
    );
}
