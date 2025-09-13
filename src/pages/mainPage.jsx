import Sidebar from '../containers/navigation/Sidebar'
import Navbar from '../containers/navigation/Navbar'
import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

const AppLayout = ({ user, isOpen }) => {
  // console.log('xxxxxxxxxxxxxxx',user)
  return (
    <>
      {user ? (
        <main className={`h-full`}>
          <section className="relative">
            <Sidebar user={user} />
          </section>
          <section
            className={`relative ${
              isOpen ? 'w-[80vw] left-[20vw]' : 'w-[96vw] left-[4vw]'
            } pt-16`} // <-- add top padding equal to navbar height
          >
            <Navbar user={user} />
            <Outlet />
          </section>

          <ToastContainer />
        </main>
      ) : (
        <></>
      )}
    </>
  )
}

export default AppLayout
