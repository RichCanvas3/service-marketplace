import '../custom-styles.css'

interface FilterButtonProps {
  name: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({ name }) => {
  return (
    <p className='filterButton'>{name}</p>
  );
};

export default FilterButton;
