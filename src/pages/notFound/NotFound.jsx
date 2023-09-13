import Button from '../../components/Button'

const NotFound = () => {
  return (
    <main className="min-h-[80vh] w-full flex flex-col items-center justify-center gap-8">
      <h1 className="text-[20px] font-bold uppercase">
        The page you are trying to access could not be found
      </h1>
      <Button value="Go to dashboard" route="/dashboard" />
    </main>
  )
}

export default NotFound
