import Card from '../../components/Card'
import CreateAdminModel from '../../components/models/CreateAdminModel'
const Admins = () => {
  const data = [
    {
      name: 'Fiston alvin',
      phone: '+1234567890',
      nationalId: 'ABC123XYZ',
      email: 'john.doe@example.com',
    },
    {
      name: 'Fiston alvin',
      phone: '+1234567890',
      nationalId: 'ABC123XYZ',
      email: 'john.doe@example.com',
    },
    {
      name: 'Jane Smith',
      phone: '+9876543210',
      nationalId: 'XYZ456ABC',
      email: 'jane.smith@example.com',
    },
    {
      name: 'Jane Smith',
      phone: '+9876543210',
      nationalId: 'XYZ456ABC',
      email: 'jane.smith@example.com',
    },
    {
      name: 'Jane Smith',
      phone: '+9876543210',
      nationalId: 'XYZ456ABC',
      email: 'jane.smith@example.com',
    },
    {
      name: 'Jane Smith',
      phone: '+9876543210',
      nationalId: 'XYZ456ABC',
      email: 'jane.smith@example.com',
    },
  ]
  return (
    <div className="w-[98%] mx-auto relative">
      <div>
        <CreateAdminModel className="relative top-4" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 absolute top-16">
        {data.map((admin, index) => (
          <Card
            key={index}
            name={admin.name}
            phone={admin.phone}
            nationalId={admin.nationalId}
            email={admin.email}
          />
        ))}
      </div>
    </div>
  )
}

export default Admins
