import { useStore } from 'effector-react';
import { AsyncPaginate } from 'react-select-async-paginate';
import { FC } from 'react'
import { $localUnits, app, organisationUnits } from "../../Store";
import { OUMapping } from './OUMapping';
import { findName, addOuMapping } from '../../utils';

interface OUProps {
  unit: string;
}

export const OUSelect: FC<OUProps> = ({ unit }) => {
  const store = useStore(app);
  const units = useStore($localUnits)

  async function loadOptions(search: string, loadOptions: any, { page }: any) {
    const options = units.filter((i: any) =>
      i.name.toLowerCase().includes(search.toLowerCase()) || Object.values(i.parent).join('').includes(search.toLowerCase())
    );

    let per_page = 10;
    let offset = (page - 1) * per_page;

    let paginatedItems = options.slice(offset).slice(0, 10);
    let total_pages = Math.ceil(options.length / per_page);
    return {
      options: paginatedItems.map(({ id, name, parent }: any) => {
        return { value: id, label: name }
      }),
      hasMore: page < total_pages,
    };
  }

  return <AsyncPaginate
    value={store.mapping.organisationUnitMapping[unit]?.equivalent}
    onChange={addOuMapping(unit)}
    loadOptions={loadOptions}
    additional={{
      page: 1,
    }}
  />
}

export const DefaultOrganisationUnits = () => {
  const units = useStore(organisationUnits);
  return <OUMapping />
}