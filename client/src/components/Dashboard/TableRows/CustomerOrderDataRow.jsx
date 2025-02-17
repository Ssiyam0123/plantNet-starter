import PropTypes from 'prop-types'
import { useState } from 'react'
import DeleteModal from '../../Modal/DeleteModal'
import axios from 'axios';
import toast from 'react-hot-toast';
const CustomerOrderDataRow = ({order,handleDelete,refetch}) => {
  const {
    address,
    category,
    customer: { name: customerName, email: customerEmail, image: customerImage },
    image,
    name,
    plantId,
    price,
    quantity,
    seller,
    status,
    _id,
  } = order;
  let [isOpen, setIsOpen] = useState(false)
  const closeModal = () => setIsOpen(false)

  const handleOrderDelete =  async () =>{
    // console.log(id)
    const res = await axios.delete(`${import.meta.env.VITE_API_URL}/cancelorder/${_id}`)
    console.log(res.data)
    if(res.data.deletedCount>0){
      toast.success('item has been deleted')
      refetch()
      closeModal()
    }
    return res.data
   
  }

  return (
    <tr>
      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <div className='flex items-center'>
          <div className='flex-shrink-0'>
            <div className='block relative'>
              <img
                alt='profile'
                src={image}
                className='mx-auto object-cover rounded h-10 w-15 '
              />
            </div>
          </div>
        </div>
      </td>

      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <p className='text-gray-900 whitespace-no-wrap'>{name}</p>
      </td>
      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <p className='text-gray-900 whitespace-no-wrap'>{category}</p>
      </td>
      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <p className='text-gray-900 whitespace-no-wrap'>${price}</p>
      </td>
      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <p className='text-gray-900 whitespace-no-wrap'>{quantity}</p>
      </td>
      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <p className='text-gray-900 whitespace-no-wrap'>{status}</p>
      </td>

      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <button
          onClick={() => setIsOpen(true)}
          className='relative disabled:cursor-not-allowed cursor-pointer inline-block px-3 py-1 font-semibold text-lime-900 leading-tight'
        >
          <span className='absolute cursor-pointer inset-0 bg-red-200 opacity-50 rounded-full'></span>
          <span className='relative cursor-pointer'>Cancel</span>
        </button>

        <DeleteModal handleYesButton={handleOrderDelete} id={_id} isOpen={isOpen} closeModal={closeModal} />
      </td>
    </tr>
  )
}

CustomerOrderDataRow.propTypes = {
  order: PropTypes.object,
  refetch: PropTypes.func,
}

export default CustomerOrderDataRow
