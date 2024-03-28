import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import toastr from 'toastr';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import sortBy from 'lodash/sortBy';
import Tippy from '@tippyjs/react';
import '../../assets/css/spinner.css';
import 'tippy.js/dist/tippy.css';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useDispatch } from 'react-redux';
import IconBell from '../../components/Icon/IconBell';
import IconXCircle from '../../components/Icon/IconXCircle';
import IconPencil from '../../components/Icon/IconPencil';
import IconTrashLines from '../../components/Icon/IconTrashLines';


const MultipleTables = () => {

    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(true);

    const [torneosList, setData] = useState([]);

    useEffect(() => {
        fetchData();
        console.log('list'+torneosList)// Llama a la función fetchData() al montar el componente
    }, []);  

    if (sessionStorage.getItem('usuario') == null) {        

        navigate('/');
       
    }
    ///////GET TOKEN//////////////////////////////////////////////////////////

    const getToken = async () => {
        
        var data_token = {
            sub: sessionStorage.getItem('email'),
            ttl: 43200,
            aud: "roni.dinossolutions.com",
            roles: sessionStorage.getItem('roles'),
            scope: "*"
        };

        var headers = {
            'Content-Type': 'application/x-www-form-urlencoded', // Tipo de contenido de la solicitud
            'Access-Control-Allow-Origin': "*"
        };
        
        try {
            const response = await axios.post('https://apis.dinossolutions.com/janus/badge', data_token);
            console.log('Respuesta del servidor:', response.data);
            // Aquí puedes manejar la respuesta del servidor, como actualizar el estado de tu componente.
            if(response.status === 200) {      
        
                var token_resp = response.data["access_token"]
                console.log("Token_resp: "+token_resp)
                return token_resp;             
    
            } 
            else { console.error(response.statusText, '¡Upss!'); }
        } catch (error) {
            console.error('No se puede generar token'); 
        }
        
    };

    /////////////////////////////////////////////////////////////////////////////////////////////

    const fetchData = async () => {
        try {

            let value = await  getToken();
            console.log("Token :" + value)
            var headers = {
                'Content-Type': 'application/json', // Tipo de contenido de la solicitud
                'Authorization': 'Bearer ' + value, // Token de autorización, ajusta según tus necesidades
                'Access-Control-Allow-Origin': "*"
            };

            const response = await axios.get('https://apis.dinossolutions.com/roni/torneos_list/',{ headers: headers }); // Reemplaza con la URL de tu API
             // Actualiza el estado de data con los datos de la API
            
            setData(response.data)
            setIsActive(false)
            return torneosList
            //console.log(response)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Torneos'));
        //fetchData();
    });

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [5,10,15];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState(torneosList);
    const [recordsData, setRecordsData] = useState(initialRecords);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'nombre_torneo',
        direction: 'asc',
    });
    

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;   
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, recordsData]);

    console.log(initialRecords) 

    useEffect(() => {
        setInitialRecords(() => {
            return torneosList.filter((item:any) => { 
                return (
                    //console.log(item.nombre_torneo)
                    item.nombre_torneo.toString().toLowerCase().includes(search.toLowerCase()) ||
                    item.temporada.toLowerCase().includes(search.toLowerCase()) ||
                    item.modalidad.toLowerCase().includes(search.toLowerCase()) ||
                    item.lugar.toLowerCase().includes(search.toLowerCase()) ||
                    item.dias.toLowerCase().includes(search.toLowerCase()) ||
                    item.categoria.toLowerCase().includes(search.toLowerCase()) ||
                    item.fecha_inicio.toString().toLowerCase().includes(search.toLowerCase()) ||
                    item.fecha_fin.toString().toLowerCase().includes(search.toLowerCase())  
                );
            });
        });
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    useEffect(() => {
        const data = sortBy(torneosList, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
        setPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortStatus]);

    
    return (
        <div>                     
           
            <div className="panel mt-6">
                 {/* spinner */}                 
                    <div className="text-center" id ="overlay" style={ { display: isActive ? 'flex':'none', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>    
                        <img className="" src={`/assets/images/spinner.gif`} alt=""  id ="spinner"/>                
                                                            
                    </div>
                {/* <!-- End spinner -->     */}
                <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                    <h1 className="font-semibold text-lg dark:text-white-light">Torneos</h1>
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input type="text" className="form-input w-auto" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>
                <div className="datatables">
                    <DataTable
                        className="whitespace-nowrap table-hover"
                        records={recordsData}
                        columns={[
                            {
                                accessor: 'nombre_torneo',
                                title: 'Nombre Torneo',
                                sortable: true,
                                render: ({nombre_torneo,img}) => (
                                    <div className="flex items-center w-max">                                
                                        
                                        {/* <img className="w-9 h-9 rounded-full ltr:mr-2 rtl:ml-2 object-cover" src={img} alt="" /> */}
                                        <div>{nombre_torneo} </div>
                                    </div>
                                ),
                            },  
                            { accessor: 'lugar', title: 'Lugar', sortable: true },     
                            { accessor: 'temporada', title: 'Temporada', sortable: true },       
                            { accessor: 'modalidad', title: 'Modalidad', sortable: true },  
                            { accessor: 'dias', title: 'Días', sortable: true },    
                            { accessor: 'horarios', title: 'Horarios', sortable: true },     
                            { accessor: 'fecha_inicio', title: 'Fecha Inicio', sortable: true }, 
                            { accessor: 'fecha_fin', title: 'Fecha Fin', sortable: true },  
                            { accessor: 'categoria', title: 'Categoria', sortable: true },
                            {
                                accessor: 'action',
                                title: 'Action',
                                titleClassName: '!text-center',
                                render: () => (
                                    <div className="flex items-center w-max mx-auto gap-2">
                                        <Tippy content="Edit">
                                            <button type="button">
                                                <IconPencil />
                                            </button>
                                        </Tippy>
                                        <Tippy content="Delete">
                                            <button type="button">
                                                <IconTrashLines />
                                            </button>
                                        </Tippy>
                                    </div>
                                ),
                            },
                        ]}
                        
                        totalRecords={initialRecords.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => `Mostrando  ${from} a ${to} de ${totalRecords} registros`}
                    />
                </div>
            </div>
        </div>
    );
};

export default MultipleTables;
