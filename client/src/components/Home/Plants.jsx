import Card from './Card'
import Container from '../Shared/Container'

const Plants = ({plants}) => {
  console.log(plants)
  return (
    <Container>
      <div className='pt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8'>
        {
          plants?.map((plant)=><Card key={plant._id}/>)
        }
      </div>
    </Container>
  )
}

export default Plants
