import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect,Fragment, useState, useRef } from 'react';
import toastr from 'toastr';
import axios from 'axios';
import Select from 'react-select';
import { Link, useNavigate } from 'react-router-dom';
import sortBy from 'lodash/sortBy';
import Tippy from '@tippyjs/react';
import '../../assets/css/spinner.css';
import 'tippy.js/dist/tippy.css';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useDispatch } from 'react-redux';
import { Dialog, Transition } from '@headlessui/react';
import IconBell from '../../components/Icon/IconBell';
import IconXCircle from '../../components/Icon/IconXCircle';
import IconCamera from '../../components/Icon/IconCamera';
import IconPlus from '../../components/Icon/IconPlus';
import IconX from '../../components/Icon/IconX';
import IconPencil from '../../components/Icon/IconPencil';
import IconTrashLines from '../../components/Icon/IconTrashLines';


const MultipleTables = () => {

    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(true);
    const myElementRef = useRef(null);
    const inputFileRef = useRef(null);

    

    const [torneosList, setData] = useState([]);
    const [initialRecords, setInitialRecords] = useState(torneosList);
    const [recordsData, setRecordsData] = useState(initialRecords);
    const [modal9, setModal9] = useState(false);
    
    const defaultFile = "/assets/images/users/multi-user.jpg"

    const options = [
        { value: 'Copa', label: 'Copa' },
        { value: 'Liga', label: 'Liga' },
    ];

    const options2 = [        
        { value: 'Martes', label: 'Martes' },
        { value: 'Mercoles', label: 'Miercoles' },
        { value: 'Jueves', label: 'Jueves' },
        { value: 'Viernes', label: 'Viernes' },
        { value: 'Sabado', label: 'Sabado' },
        { value: 'Domingo', label: 'Domingo' },
    ];

    const options3 = [];

    useEffect(() => {
        fetchData();
        listaHoras();
       // Llama a la función fetchData() al montar el componente       
    }, []);  

    if (sessionStorage.getItem('usuario') == null) {        

        navigate('/');
       
    }

    const listaHoras = () => {
        // Simulamos el clic en el input file
        for (let hour = 0; hour < 17; hour++) {
            // Agregar un cero delante si la hora es menor que 10 (por ejemplo, 01, 02, ..., 09)
            for (let min = 0; min <= 30; min+=30) {
                if (hour >= 8 ) {
                    const formattedHour = hour < 10 ? `0${hour}` : `${min}`;
                    options3.push({value:formattedHour,label:formattedHour});
                } 
            }
        }
    };


     /////////////////INPUT FILE/////////////////////////////////////////////////////////      

     const handleClick = () => {
        // Simulamos el clic en el input file
        inputFileRef.current.click();
    };

     const cambiaFoto = (event:any) => {

        const img = myElementRef?.current;

        const file = event.target.files[0];

        console.log(img)

        if(file){
            const reader = new FileReader();
            reader.onload = function(e) {

                img.src = e.target?.result
                /* setImageUrl( e.target?.result?.toString()) */
            }
            reader.readAsDataURL(file)
        }else{
            img.src = defaultFile;
        }
    };
    
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
            setInitialRecords(response.data)
            setRecordsData(response.data)
            console.log('list'+torneosList)
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
    const PAGE_SIZES = [2,3,6];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    /* const [initialRecords, setInitialRecords] = useState(torneosList);
    const [recordsData, setRecordsData] = useState(initialRecords);
 */
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
    }, [page, pageSize, initialRecords]);

    //console.log(torneosList)

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
                    <button onClick={() => setModal9(true)} type="button" className="btn btn-success w-10 h-10 p-0 rounded-full">
                        <IconPlus className="w-6 h-6" />
                    </button>
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
                                            <button onClick={() => setModal9(true)} type="button">
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
            {/* FadeIn Modal */}
            <div>                
                <Transition appear show={modal9} as={Fragment}>
                    <Dialog as="div" open={modal9} onClose={() => setModal9(false)}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0" />
                        </Transition.Child>
                        <div id="fadein_modal" className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                            <div className="flex min-h-screen items-start justify-center px-4">
                                <Dialog.Panel className="panel animate__animated animate__fadeIn my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <h5 className="text-lg font-bold">Nuevo Torneo</h5>
                                        <button onClick={() => setModal9(false)} type="button" className="text-white-dark hover:text-dark">
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="p-5">
                                        <form>
                                            {/* INPUT FILE */}
                                            <div className="flex flex-col justify-center items-center">
                                                <img src="/assets/images/users/multi-user.jpg" alt="img" className="w-24 h-24 rounded-full object-cover  mb-5" id="foto" ref={myElementRef}/>
                                                <input ref={inputFileRef} className="form-control d-none" style={{display:'none'}} name="photo" id="photo" type="file" accept="image/png, image/gif, image/jpeg" onChange={cambiaFoto} />
                                                <input type="text" id="id-edit" name="id-edit" hidden/>
                                                <button onClick={handleClick} type="button" className="btn btn-info w-10 h-10 p-0 rounded-full">
                                                    <IconCamera />
                                                </button>
                                                {/* <p className="font-semibold text-primary text-xl">Jimmy Turner</p> */}
                                            </div>
                                            {/* END INPUT FILE */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">                                                
                                                <div>
                                                    <label htmlFor="name">Nombre</label>
                                                    <input id="name" name="name" type="text" placeholder="Escriba nombre" className="form-input" />
                                                </div>
                                                <div>
                                                    <label htmlFor="lugar">Lugar</label>
                                                    <input id="lugar" name="lugar" type="text" placeholder="Escriba lugar" className="form-input" />
                                                </div>
                                                <div>
                                                    <label htmlFor="temp">Temporada</label>
                                                    <input id="temp" name="temp" type="text" placeholder="Escriba temporada" className="form-input" />
                                                </div>
                                                <div>
                                                    <label htmlFor="mod">Modalidad</label>
                                                    <Select defaultValue={options[1]} options={options} isSearchable={false} id="mod" name="mod"/>
                                                </div>
                                                <div>
                                                    <label htmlFor="dias">Dias</label>
                                                    <Select placeholder="Selecciona los dias" options={options2} isMulti isSearchable={false} id="dias" name="dias"/>
                                                </div>
                                                <div>
                                                    <label htmlFor="horarios">Horarios</label>
                                                    <Select placeholder="Selecciona los dias" options={options3} isMulti isSearchable={false} id="horarios" name="horarios"/>
                                                </div>
                                            </div>
                                        </form>
                                        <div className="mt-8 flex items-center justify-end">
                                            <button onClick={() => setModal9(false)} type="button" className="btn btn-outline-danger">
                                                Cancelar
                                            </button>
                                            <button onClick={() => setModal9(false)} type="button" className="btn btn-success ltr:ml-4 rtl:mr-4">
                                                Guardar
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>
            {/* SlideIn Down */}
        </div>
    );
};

export default MultipleTables;
