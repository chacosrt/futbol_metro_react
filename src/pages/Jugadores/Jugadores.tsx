import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect,Fragment, useState, useRef } from 'react';
import toastr from 'toastr';
import axios from 'axios';
import Select from 'react-select';
import Swal from 'sweetalert2';
import Flatpickr from 'react-flatpickr';
import { render, fireEvent } from '@testing-library/react';
import { Link, useNavigate } from 'react-router-dom';
import sortBy from 'lodash/sortBy';
import Tippy from '@tippyjs/react';
import '../../assets/css/spinner.css';
import 'tippy.js/dist/tippy.css';
import 'flatpickr/dist/flatpickr.css';
import 'flatpickr/dist/themes/material_blue.css';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useDispatch,useSelector } from 'react-redux';
import { Dialog, Transition } from '@headlessui/react';
import IconBell from '../../components/Icon/IconBell';
import IconXCircle from '../../components/Icon/IconXCircle';
import IconCamera from '../../components/Icon/IconCamera';
import IconPlus from '../../components/Icon/IconPlus';
import IconX from '../../components/Icon/IconX';
import IconPencil from '../../components/Icon/IconPencil';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import { IRootState } from '../../store';
import IconTrendingUp from '../../components/Icon/IconTrendingUp';


const MultipleTables = () => {

    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(true);
    const myElementRef = useRef(null);
    const inputFileRef = useRef(null);
    const inputSearchRef  = useRef(null);
    const [torneo,setTorneo] = useState(null);
    const [torneoForm,setTorneoForm] = useState(null);
    const dispatch = useDispatch();
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const [inputSearch,setInputSearch] = useState('')

    const [jugadoresList, setData] = useState([]);
    const [torneosList, setDataTorneos] = useState([]);
    const [torneosListForm, setDataTorneosForm] = useState([]);
    const [initialRecords, setInitialRecords] = useState(jugadoresList);
    const [recordsData, setRecordsData] = useState(initialRecords);
    const [modal9, setModal9] = useState(false);
    
    const defaultFile = "/assets/images/users/multi-user.jpg"

    const [options, setOptions] = useState([]);

    /* const options = [
        { value: '1', label: 'Activo' },
        { value: '2', label: 'Baja' },
    ]; */

    useEffect(() => {
        console.log('se ejecuta primero')
        fetchData();
        
        //listaHoras();       
       
        //setSearchSelect(torneo)
       
       // Llama a la función fetchData() al montar el componente       
    }, []);  

    if (sessionStorage.getItem('usuario') == null) {        

        navigate('/');
       
    }

    const aplyFilter = () => {
        
        console.log('aplica filtro' +inputSearch)
        setSearchSelect(inputSearch)
    };


     /////////////////INPUT FILE/////////////////////////////////////////////////////////      

     const handleClick = () => {
        // Simulamos el clic en el input file
        inputFileRef.current.click();
    };

     const cambiaFoto = (event:any) => {

        const img = myElementRef?.current;

        const file = event.target.files[0];

        //console.log(img)

        if(file){
            const reader = new FileReader();
            reader.onload = function(e) {

                img.src = e.target?.result
                setImg(img.src)
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
               // console.log("Token_resp: "+token_resp)
                return token_resp;             
    
            } 
            else { console.error(response.statusText, '¡Upss!'); }
        } catch (error) {
            console.error('No se puede generar token'); 
        }
        
    };


    /////////////ALPHA ID//////////////////////////////////////////////////////////////////////

    const getAlpha = async () => {

        try{
            let value = await  getToken();
            var headers = {
                'Content-Type': 'application/json', // Tipo de contenido de la solicitud
                'Authorization': 'Bearer ' + value, // Token de autorización, ajusta según tus necesidades
                'Access-Control-Allow-Origin': "*"
            };
            const response = await axios.get('https://apis.dinossolutions.com/roni/admin/'+idEdit+'/alpha_id',{headers:headers});

            if(response.status === 200) {      
        
                var alpha_id = response.data["alpha_id"]
               // console.log("Token_resp: "+token_resp)
                return alpha_id;             
    
            } 
        }catch (error) {
            console.error('Error fetching data:', error);
        }

        
    }

    /////////////////////////////////////////////////////////////////////////////////////////////

    const fetchData = async () => {
        try {

            let value = await  getToken();
            //console.log("Token :" + value)
            var headers = {
                'Content-Type': 'application/json', // Tipo de contenido de la solicitud
                'Authorization': 'Bearer ' + value, // Token de autorización, ajusta según tus necesidades
                'Access-Control-Allow-Origin': "*"
            };

            const response = await axios.get('https://apis.dinossolutions.com/roni/jugadores_list/',{ headers: headers }); // Reemplaza con la URL de tu API
             // Actualiza el estado de data con los datos de la API
            
            setData(response.data)
                     
            setInitialRecords(response.data)
            setRecordsData(response.data)
            setOptions([{ value: '1', label: 'Activo' },{ value: '2', label: 'Baja' }])
            setEstatus({ value: '1', label: 'Activo' })


            if(torneosList.length == 0){
                getTorneos();
            }
            else{
                setPage(1);               
                
                inputSearchRef.current.click()
                setTorneo(torneosList[0])
                setIsActive(false) 
            }
            
             
            //console.log('list'+JSON.stringify(response.data))
            return jugadoresList
            //console.log(response)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    //////////////////////////////////////OBTENER TORNEOS///////////////////////////////////////////////////////

    const getTorneos = async () => {
        try {

            let value = await  getToken();
            //console.log("Token :" + value)
            var headers = {
                'Content-Type': 'application/json', // Tipo de contenido de la solicitud
                'Authorization': 'Bearer ' + value, // Token de autorización, ajusta según tus necesidades
                'Access-Control-Allow-Origin': "*"
            };

            const response = await axios.get('https://apis.dinossolutions.com/roni/torneos_list/',{ headers: headers }); // Reemplaza con la URL de tu API
             // Actualiza el estado de data con los datos de la API
             const tor_list = []
             const tor_listForm = []

             const torneos = response.data
             
             
             for(let option=0; option < torneos.length; option++){
                 const newOption = {value:torneos[option].id,label:torneos[option].nombre_torneo}
                 const newOptionForm = {value:torneos[option].id,label:torneos[option].nombre_torneo}
                 tor_list.push(newOption);
                 tor_listForm.push(newOptionForm);
             }
            setDataTorneos(tor_list)    
            setDataTorneosForm(tor_listForm)         
            setTorneo(tor_list[0])
            setTorneoForm(tor_listForm[0])
            setInputSearch(tor_list[0].label)
            
            inputSearchRef.current.click()
            setIsActive(false) 
            //setSearchSelect(torneosList[0].value)
            
        } catch (error) { 
            console.error('Error fetching data:', error);
        }
    };


      //////////////////////////////////////OBTENER EQUIPOS///////////////////////////////////////////////////////

      const getEquipos = async () => {
        try {

            let value = await  getToken();
            //console.log("Token :" + value)
            var headers = {
                'Content-Type': 'application/json', // Tipo de contenido de la solicitud
                'Authorization': 'Bearer ' + value, // Token de autorización, ajusta según tus necesidades
                'Access-Control-Allow-Origin': "*"
            };

            var alpha_id = await getAlpha();

            const response = await axios.get('https://apis.dinossolutions.com/roni/equipos/'+alpha_id+'/id_torneo',{ headers: headers }); // Reemplaza con la URL de tu API
             // Actualiza el estado de data con los datos de la API
             const tor_list = []
             const tor_listForm = []

             const torneos = response.data
             
             
             for(let option=0; option < torneos.length; option++){
                 const newOption = {value:torneos[option].nombre_torneo,label:torneos[option].nombre_torneo}
                 const newOptionForm = {value:torneos[option].id,label:torneos[option].nombre_torneo}
                 tor_list.push(newOption);
                 tor_listForm.push(newOptionForm);
             }
            setDataTorneos(tor_list)    
            setDataTorneosForm(tor_listForm)         
            setTorneo(tor_list[0])
            setTorneoForm(tor_listForm[0])
            setInputSearch(tor_list[0].value)
            
            inputSearchRef.current.click()
            setIsActive(false) 
            //setSearchSelect(torneosList[0].value)
            
        } catch (error) { 
            console.error('Error fetching data:', error);
        }
    };


    ///////////// AGREGAR/ACTUALIZAR TORNEOS/////////////////////////////////////////

    const [modalTitle, setTitle] = useState('Nuevo Torneo')

    const [idEdit, setId] = useState('');
    const [imgEquipo, setImg] = useState('');

    const [name, setName] = useState('');
    const [delegado, setDelegado] = useState('');
    const [estatus, setEstatus] = useState(null);
    
    const imgRef = useRef(null); 

    const handleTorneoChange = (event: any) => {        
        setPage(1)
        setSearchSelect(event.label)
        //setInputSearch(event.value)
        setTorneo(event)   
        console.log(inputSearch)     
        
    };

    const handleTorneoFormChange = (event: any) => {        
        
        setTorneoForm(event)   
        console.log(event)     
        
    };
    

    const handleNameChange = (event: any) => {
        setName(event.target.value);
        
    };

    const handleDelegadoChange = (event: any) => {
        setDelegado(event.target.value);
        
    };

    const handleEstatusChange = (event: any) => {        
        setEstatus(event);
        console.log(event)   
    };

   

  
    ///////////////////////rellenar formulario para editar/////////////////////////////////////////

    const editClick = async (id:any) => {

        setId(id);
        setModal9(true); 


        setTitle('Editar Equipo')
        console.log(idEdit)
        var token = await getToken()

        var headers = {
            'Content-Type': 'application/json', // Tipo de contenido de la solicitud
            'Authorization': 'Bearer ' + token, // Token de autorización, ajusta según tus necesidades
            'Access-Control-Allow-Origin': "*"
        };
        
        const resp = await axios.get('https://apis.dinossolutions.com/roni/admin/'+id+'/alpha_id',{headers:headers});

        var alpha_id = resp.data["alpha_id"]
        

        var url = 'https://apis.dinossolutions.com/roni/equipos' + '/' + alpha_id +'/id';

        try {
            const response = await axios.get(url,{headers:headers});
            console.log('Respuesta del servidor:', response.data);
            // Aquí puedes manejar la respuesta del servidor, como actualizar el estado de tu componente.
            if(response.status == 200) {    
                
                var datos = response.data              
        
                const image = myElementRef?.current;
                image.src = datos.img_equipo
                let est = datos.estatus.toString()
                
                if(est == '1'){
                   setEstatus(options[0]);
                }else{
                    setEstatus(options[1]);
                }

                setName(datos.nombre);
                setTorneoForm({label:datos.liga_equipo.nombre_torneo,value:datos.liga});
                setDelegado(datos.delegado);
                              
                setImg(datos.img_equipo)  

            } 
            else { toastr.error(response.statusText, '¡Upss!'); }
        } catch (error) {
            console.error(error); 
        } 
    };

    /////////////////////////////////////////////////////////////////////////////////////////////////

    const openModal = () => {
        setModal9(true);
      };
    
      const closeModal = () => {
        setModal9(false);
        setTitle('Nuevo Equipo')
        setId('');
        setImg('');
        setName('');
        setTorneoForm(torneosList[0])
        setDelegado('')
        setEstatus('1')
      };



    //////////////////////////////////////////////////////////////////////////

    const guardaEquipo = async (event:any) =>{

        event.preventDefault();
        closeModal() 
        setIsActive(true)
        
        const formData = new FormData();

        formData.append('name', name);
        formData.append('liga', torneo);
        formData.append('delegado', delegado);
        formData.append('estatus', estatus.value);
        
        const data_equipo = {
            nombre: name,
            liga:torneoForm.value,
            delegado: delegado,
            estatus: parseInt(estatus.value),           
            img_equipo: imgEquipo
        };

        var token = await getToken()

        var url = "";
        var text =""

        var headers = {
            'Content-Type': 'application/json', // Tipo de contenido de la solicitud
            'Authorization': 'Bearer ' + token, // Token de autorización, ajusta según tus necesidades
            'Access-Control-Allow-Origin': "*"
          };

        if (idEdit != ''){
            var alpha_id = await getAlpha();
            url = 'https://apis.dinossolutions.com/roni/equipos' + '/' + alpha_id;
            text = 'Tu equipo se edito correctamente';
        }else{
            url = 'https://apis.dinossolutions.com/roni/equipos/';
            text = 'Tu equipo se creo correctamente';
        }
    
        try {
            const response = await axios.post(url,data_equipo,{headers:headers});
            console.log('Respuesta del servidor:', response.data);
            // Aquí puedes manejar la respuesta del servidor, como actualizar el estado de tu componente.
            if(response.status == 201) {    
                
                fetchData()                                                    

                Swal.fire({
                    icon: 'success',
                    title: 'Exito!',
                    text: text,
                    padding: '2em',
                    showConfirmButton: false,
                    customClass: 'sweet-alerts',
                    timer:1500
                });

                
               
            } 
            else { toastr.error(response.statusText, '¡Upss!'); }
            
          } catch (error) {
            console.error(error); 
          } 
    }

    ///////////////////////////Elimina Torneo//////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const deleteClick = async (id:any) => {

        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-danger',
                cancelButton: 'btn btn-outline-primary fw-medium text-decoration-none ltr:mr-3 rtl:ml-3',
                popup: 'sweet-alerts',
            },
            buttonsStyling: false,
        });
        swalWithBootstrapButtons
            .fire({
                title: 'Deseas eliminar este Equipo?',
                text: "No se podrá revertir esta acción!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Si, eliminalo!',
                cancelButtonText: 'No, cancelar!',
                reverseButtons: true,
                padding: '2em',
            })
            .then(async (result) => {
                if (result.value) {

                    var token = await getToken()

                    var headers = {
                        'Content-Type': 'application/json', // Tipo de contenido de la solicitud
                        'Authorization': 'Bearer ' + token, // Token de autorización, ajusta según tus necesidades 
                        'Access-Control-Allow-Origin': "*"
                    };
                    
                   const resp = await axios.get('https://apis.dinossolutions.com/roni/admin/'+id+'/alpha_id',{headers:headers});
            
                   var alpha_id = resp.data["alpha_id"]
                    
            
                    var url = 'https://apis.dinossolutions.com/roni/equipos/' + alpha_id +'/delete';

                    try {
                        const response = await axios.post(url,{id:alpha_id},{headers:headers});
                        console.log('Respuesta del servidor:', response.data);
                        // Aquí puedes manejar la respuesta del servidor, como actualizar el estado de tu componente.
                        if(response.status == 202) {  
                            setIsActive(true)
                            swalWithBootstrapButtons.fire('Eliminado!', 'El equipo se elimino.', 'success');
                            fetchData() 
                            
                        }
                    }catch (error) {
                        console.error(error); 
                    } 
            
                    
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    swalWithBootstrapButtons.fire('Cancelado', 'El equipo no se elimino', 'error');
                }
            });

    }


   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   
    useEffect(() => {
        //console.log('ejecuto dispatch')
        dispatch(setPageTitle('Jugadores'));
        //fetchData();
    });

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [5,10,15];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    /* const [initialRecords, setInitialRecords] = useState(jugadoresList);
    const [recordsData, setRecordsData] = useState(initialRecords);
 */
    const [search, setSearch] = useState('');
    const [searchSelect, setSearchSelect] = useState('');

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'liga',
        direction: 'asc',
    });
    

    useEffect(() => {
        //console.log('seteo pagina')
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        //console.log('paginador')
        const from = (page - 1) * pageSize;
        const to = from + pageSize;   
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    //console.log(jugadoresList)

    useEffect(() => {
        setInitialRecords(() => {
            return jugadoresList.filter((item:any) => { 
                return (
                    //console.log(item.nombre_torneo)
                    item.nombre.toString().toLowerCase().includes(search.toLowerCase()) ||
                    item.ap_p.toString().toLowerCase().includes(search.toLowerCase()) ||
                    item.ap_m.toString().toLowerCase().includes(search.toLowerCase()) ||
                    item.edad.toString().toLowerCase().includes(search.toLowerCase()) ||
                    item.expediente.toString().toLowerCase().includes(search.toLowerCase()) ||
                    item.seccional.toString().toLowerCase().includes(search.toLowerCase()) ||
                    item.direccion.toString().toLowerCase().includes(search.toLowerCase()) ||
                    item.telefono.toString().toLowerCase().includes(search.toLowerCase()) ||
                    item.equipo_jugador.nombre.toString().toLowerCase().includes(search.toLowerCase()) ||
                    item.equipo_jugador.liga_equipo.nombre_torneo.toLowerCase().includes(search.toLowerCase()) 
                    //item.estatus.toLowerCase().includes(search.toLowerCase()) 
                     
                );
            });
        });
       // console.log('initialRecords')
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]); 

    useEffect(() => {
        setInitialRecords(() => {
            return jugadoresList.filter((item:any) => { 
                return (
                    //console.log(item.nombre_torneo)                    
                    item.nombre.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.ap_p.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.ap_m.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.edad.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.expediente.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.seccional.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.direccion.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.telefono.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.equipo_jugador.nombre.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.equipo_jugador.liga_equipo.nombre_torneo.toLowerCase().includes(searchSelect.toLowerCase())  
                    //item.estatus.toLowerCase().includes(search.toLowerCase()) 
                     
                );
            });
        });
        //console.log('initialrecords2')
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchSelect]); 

    useEffect(() => {
        //console.log('ordena columnas')
        const data = sortBy(jugadoresList, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'asc' ? data.reverse() : data);
        setPage(1);
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortStatus]);

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    return (
        <div>     
            <div className="panel mt-6">
                 {/* spinner */}                 
                    <div className="text-center" id ="overlay" style={ { display: isActive ? 'flex':'none', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>    
                        <img className="" src={`/assets/images/spinner.gif`} alt=""  id ="spinner"/>                
                                                            
                    </div>
                {/* <!-- End spinner -->     */}
                <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                    <h1 className="font-semibold text-lg dark:text-white-light">Jugadores</h1>
                    <button onClick={() => setModal9(true)} type="button" className="btn btn-success w-10 h-10 p-0 rounded-full">
                        <IconPlus className="w-6 h-6" />
                    </button>
                    <div className='col-lg-2'>                        
                        <Select onChange={(e) => handleTorneoChange(e)}  className='z-[999] col-lg-2' placeholder="select-filtro" value={torneo} options={torneosList} isSearchable={false} id="torneo" name="torneo"/>
                    </div>
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input type="text" className="form-input w-auto" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        <input type="text" className="form-input w-auto" placeholder="Buscar..." value={inputSearch} ref={inputSearchRef} id="input_search" onClick={aplyFilter} hidden/>

                    </div>
                </div>
                <div className="datatables">
                    <DataTable
                        
                        className="whitespace-nowrap table-hover"
                        records={recordsData}                        
                        columns={[
                            {
                                accessor: 'img',
                                title: 'Foto',
                                cellsClassName: 'text-center',
                                sortable: true,
                                render: ({img}) => (
                                    <div className="flex items-center w-max">                                
                                        
                                        <img className="w-9 h-9 rounded-full ltr:mr-2 rtl:ml-2 object-cover" src={img} alt="" />
                                        {/* <div dangerouslySetInnerHTML={{ __html: img }}/> */}
                                        {/* <div>{nombre+' '+ap_p+' '+ap_m}</div> */}
                                    </div>
                                ),
                            }, 
                            {
                                accessor: 'nombre',
                                title: 'Jugador',
                                cellsClassName: 'text-center text-lowercase flex',
                                sortable: true,
                                render: ({nombre,ap_p,ap_m,img}) => (
                                    <div className="flex items-center w-max">                                
                                        
                                        {/* <img className="w-9 h-9 rounded-full ltr:mr-2 rtl:ml-2 object-cover" src={img} alt="" /> */}
                                        {/* <div dangerouslySetInnerHTML={{ __html: img }}/> */}
                                        <div>{nombre+' '+ap_p+' '+ap_m}</div>
                                    </div>
                                ),
                            },  
                            { accessor: 'edad', title: 'Edad',cellsClassName: 'text-center', sortable: true },    
                            { accessor: 'equipo_jugador.liga_equipo.nombre_torneo', title: 'Liga',titleClassName: '!text-center', sortable: true },   
                            { accessor: 'equipo_jugador.nombre', title: 'Equipo',titleClassName: '!text-center', sortable: true },                 
                            { accessor: 'expediente', title: 'Expediente',titleClassName: '!text-center', sortable: true }, 
                            { accessor: 'seccional', title: 'Seccional',titleClassName: '!text-center', sortable: true },     
                            { accessor: 'direccion', title: 'Domicilio',titleClassName: '!text-center', sortable: true },            
                            { accessor: 'telefono', title: 'Telefono',titleClassName: '!text-center', sortable: true }, 
                            { accessor: 'delegado',
                              title: 'Delegado',
                              titleClassName: '!text-center',
                              sortable: true,
                              render: ({delegado}) => (  
                                
                                
                                                             
                                <div className={`${delegado === true ? 'text-success bg-success-light' : 'text-danger bg-danger-light'} flex items-center w-max`}>                           
                                    <div>
                                        <span className={`badge badge-outline-${delegado === true ? 'success' : 'danger'} `}>{delegado === true ? 'Si' : 'No'}</span>
                                    </div>
                                </div>
                             ),  
                            
                            }, 
                            { accessor: 'estatus',
                              title: 'Estatus',
                              titleClassName: '!text-center',
                              sortable: true,
                              render: ({estatus}) => (  
                                
                                
                                                             
                                <div className={`${estatus === 1 ? 'text-success bg-success-light' : 'text-danger bg-danger-light'} flex items-center w-max`}>                           
                                    <div>
                                        <span className={`badge badge-outline-${estatus === 1 ? 'success' : 'danger'} `}>{estatus === 1 ? 'Activo' : 'Baja'}</span>
                                    </div>
                                </div>
                             ),  
                            
                            },     
                            {
                                accessor: 'action',
                                title: 'Action',
                                titleClassName: '!text-center',
                                render: ({id}) => (
                                    <div className="flex items-center w-max mx-auto gap-2">
                                        <Tippy content="Edit">
                                            <button onClick={() => editClick(id)} type="button">
                                                <IconPencil />
                                            </button>
                                        </Tippy>
                                        <Tippy content="Delete">
                                            <button onClick={() => deleteClick(id)} type="button">
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
            <div className='modal-create'>                
                <Transition appear show={modal9} as={Fragment}>
                    <Dialog as="div" open={modal9} onClose={() => closeModal()}>
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
                        <div id="fadein_modal" className="fixed  inset-0 z-[999] overflow-y-auto bg-[black]/60">
                            <div className="flex min-h-screen items-start justify-center px-4">
                                <Dialog.Panel className="panel col-md-6 animate__animated animate__fadeIn my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <h5 className="text-lg font-bold">{modalTitle}</h5>
                                        <button onClick={() => closeModal()} type="button" className="text-white-dark hover:text-dark">
                                            <IconX />
                                        </button>
                                    </div>
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
                                    <div className="p-5">
                                        <form onSubmit={guardaEquipo}>                                            
                                            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">                                                
                                                <div className='col-lg-6'>
                                                    <label htmlFor="name">Nombre</label>
                                                    <input value={name} onChange={handleNameChange} id="name" name="name" type="text" placeholder="Escriba nombre" className="form-input" />
                                                </div>
                                                <div>
                                                    <label htmlFor="liga">Liga</label>
                                                    <Select onChange={(e) => handleTorneoFormChange(e)}  className='z-[999] col-lg-2' placeholder="select-filtro" value={torneoForm} options={torneosListForm} isSearchable={false} id="liga" name="liga"/>
                                                </div>
                                                <div>
                                                    <label htmlFor="delegado">Delegado</label>
                                                    <input value={delegado} onChange={handleDelegadoChange} id="delegado" name="delegado" type="text" placeholder="Nombre del delegado" className="form-input" />
                                                </div>
                                                <div>
                                                    <label htmlFor="estatus">Estatus</label>
                                                    <Select onChange={(e) => handleEstatusChange(e)} value={estatus}  options={options} isSearchable={false} id="estatus" name="estatus"/>
                                                </div>                                                                                         
                                            </div>
                                            <div className="mt-8 flex items-center justify-end">
                                                <button onClick={() => closeModal()} type="button" className="btn btn-outline-danger">
                                                    Cancelar
                                                </button>
                                                <button type="submit"  className="btn btn-success ltr:ml-4 rtl:mr-4">
                                                    Guardar
                                                </button>
                                            </div>
                                        </form>
                                        
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
