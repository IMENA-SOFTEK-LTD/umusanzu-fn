// eslint-disable-next-line import/no-absolute-path
import logo from '/logo.png'

function Navbar () {
  return (

<nav class="bg-white drop-shadow-2xl fixed w-full z-20 top-0 left-0 border-b border-gray-200 dark:border-gray-300">
  <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-2">
  <a href="https://flowbite.com/" class="flex items-center">
      <img src={logo} class="h-12 mr-3" alt="Imena Logo"/>
      <span class="self-center text-xl font-semibold ">Imena Softek</span>
  </a>

  <form>
    <div class="relative">
        <div class="absolute inset-y-0 flex items-center pl-3 pointer-events-none">
            <svg class="w-4 h-4 text-gray-900 dark:text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
        </div>
        <input type="search" id="default-search" class="block p-4 pl-10 text-sm text-gray-900 border border-gray-100 rounded-lg focus:ring-blue-200 focus:border-blue-200 dark:border-gray-400 dark:focus:ring-blue-200 dark:focus:border-blue-200 bg-grey-300" placeholder="Search..." required/>
        <button type="submit" class="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
    </div>
</form>
  </div>

</nav>
  )
}

export default Navbar
