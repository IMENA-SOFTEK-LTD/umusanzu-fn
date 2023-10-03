import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import { setPathRoute } from "../../states/features/navigation/sidebarSlice";
import { useDispatch } from "react-redux";

const Reports = ({ user }) => {

    const navigate = useNavigate();
    const dispatch = useDispatch()

  return (
    <main className="min-h-[80vh] w-[90%] mx-auto flex flex-col items-start justify-start my-12 gap-6">
        <h1 className="flex items-center justify-center text-[20px] text-center uppercase text-primary font-bold">Please select a report you want to generate</h1>
        <ul className="flex flex-col items-start justify-start gap-2">
            <li><Button value='Sectors performances' onClick={(e) => {
                e.preventDefault()
                navigate('/reports/sectors')
            }} /></li>
            <li><Button route='/select-department' onClick={(e) => {
                e.preventDefault
                dispatch(setPathRoute('/reports/villages'))
                localStorage.setItem('pathRoute', '/reports/villages')
                navigate('/select-department')
            }} value='Villages performances' /></li>
        </ul>
    </main>
  )
}

export default Reports;
