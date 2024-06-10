import { useState, useEffect } from "react";
import { BsJustify, BsX } from "react-icons/bs";

const navigation = [
    { name: '기업부스', href: '#' },
    { name: '개인부스', href: '#' },
    { name: '부스리스트', href: '/booth/list'},
    { name: '부스등록', href: '/booth/registration' },
    { name: '커뮤니티', href: '#' },
];

function TopNav() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleClick = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <>
            {/* PC 화면 Nav */}
            <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-in-out ${scrollY > 50 ? 'bg-slate-50 drop-shadow-md shadow-inner' : 'bg-blue-900'} ${mobileMenuOpen ? 'hidden' : 'block'}`}>
                <nav className="flex items-center justify-between py-3 px-10 lg:px-8" aria-label="Global">
                    <div className="flex lg:flex-1">
                        <a href="/" className="-m-1.5 p-1.5">
                            <p className={`lotteria-font inline-block text-4xl ${scrollY > 50 ? 'text-blue-900' : 'text-white'}`}>
                                슬리슬리
                            </p>
                        </a>
                    </div>
                    <div className="flex lg:hidden">
                        <button
                            type="button"
                            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
                            onClick={handleClick}
                        >
                            <BsJustify className={`h-6 w-6 ${scrollY > 50 ? 'text-black' : 'text-white'}`} aria-hidden="true" />
                        </button>
                    </div>
                    <div className="hidden lg:flex lg:gap-x-12">
                        {navigation.map((item) => (
                            <a key={item.name} href={item.href} className={`text-sm font-semibold leading-6 ${scrollY > 50 ? 'text-black' : 'text-white'}`}>
                                {item.name}
                            </a>
                        ))}
                    </div>
                    <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                        <a href="/login" className={`text-sm font-semibold leading-6 ${scrollY > 50 ? 'text-black' : 'text-white'}`}>
                            로그인 <span aria-hidden="true">&rarr;</span>
                        </a>
                    </div>
                </nav>
            </header>

            {/* 모바일 Nav */}
            <div className={`lg:hidden fixed inset-0 z-50 ${mobileMenuOpen ? 'block' : 'hidden'}`} onClick={handleClick}>
                <div className="fixed inset-0 z-50" />
                <div className="fixed inset-y-0 right-0 z-50 w-1/2 overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 shadow-inner">
                    <div className="flex items-center justify-between">
                        <a href="#" className="-m-1.5 p-1.5">
                            <p className="lotteria-font inline-block text-4xl text-blue-900">
                                슬리슬리
                            </p>
                        </a>
                        <button
                            type="button"
                            className="-m-2.5 rounded-md p-2.5 text-gray-700"
                            onClick={handleClick}
                        >
                            <BsX className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                    <div className="mt-6 flow-root">
                        <div className="-my-6 divide-y divide-gray-500/10">
                            <div className="space-y-2 py-6">
                                {navigation.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                    >
                                        {item.name}
                                    </a>
                                ))}
                            </div>
                            <div className="py-6">
                                <a
                                    href="/login"
                                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                >
                                    로그인
                                </a>
                                <a
                                    href="/signup"
                                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                >
                                    회원가입
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default TopNav;
