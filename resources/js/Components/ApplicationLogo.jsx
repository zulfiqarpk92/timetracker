export default function ApplicationLogo({ size = "40" }) {
    return (
        <div className="flex justify-center">
            <img 
                src="/images/sparking-asia-logo.png" 
                className={`w-${size} h-${size} object-contain filter drop-shadow-lg`} 
                alt="Sparking Asia Logo"
            />
        </div>
    );
}
