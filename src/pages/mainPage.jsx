import Sidebar from "../containers/navigation/Sidebar";
import Navbar from "../containers/navigation/Navbar";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

const AppLayout = ({user, isOpen}) => {
    return (
        <main className={`relative h-full`}>
            <section className="absolute">
                <Sidebar user={user} />
            </section>
            <section
                className={`absolute ${
                isOpen
                    ? 'w-[80vw] left-[20vw]'
                    : 'w-[96vw] left-[4vw]'
                }`}
            >
                <Navbar user={user} />
                <Outlet />
            </section>
            <ToastContainer />
        </main>    
    )
}

export default AppLayout;
