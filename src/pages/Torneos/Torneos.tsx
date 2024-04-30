import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect,Fragment, useState, useRef } from 'react';
import toastr from 'toastr';
import axios from 'axios';
import Select from 'react-select';
import Swal from 'sweetalert2';
import Flatpickr from 'react-flatpickr';
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


const MultipleTables = () => {

    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(true);
    const myElementRef = useRef(null);
    const inputFileRef = useRef(null);
    const dispatch = useDispatch();
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const [date1, setDate1] = useState<any>('2024-01-01');    
    const [horariosList,setListHoras] = useState([])
    const [diasList,setListDias] = useState([])

    const [torneosList, setData] = useState([]);
    const [initialRecords, setInitialRecords] = useState(torneosList);
    const [recordsData, setRecordsData] = useState(initialRecords);
    const [modal9, setModal9] = useState(false);
    const [options,setOptions] = useState([])
    const [options2,setOptions2] = useState([])
    const [options4,setOptions4] = useState([])
    
    const defaultFile = "/assets/images/users/multi-user.jpg"

    /* const options = [
        { value: 'Copa', label: 'Copa' },
        { value: 'Liga', label: 'Liga' },
    ]; */

    /* const options2 = [        
        { value: 'Martes', label: 'Martes' },
        { value: 'Miercoles', label: 'Miercoles' },
        { value: 'Jueves', label: 'Jueves' },
        { value: 'Viernes', label: 'Viernes' },
        { value: 'Sabado', label: 'Sabado' },
        { value: 'Domingo', label: 'Domingo' },
    ]; */

    const [options3, setOption] = useState([]);

    /* const options4 = [
        { value: 'Veteranos', label: 'Veteranos' },
        { value: 'Libre', label: 'Libre' },
    ]; */

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
        const list = []
        setOption([])
        for (let hour = 0; hour <= 17; hour++) {
            // Agregar un cero delante si la hora es menor que 10 (por ejemplo, 01, 02, ..., 09)
            for (let min = 0; min <= 30; min+=30) {
                if (hour >= 8 ) {
                    const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;
                    const formattedMin = min == 0 ? `${min}0` : `${min}`;
                    const hora = formattedHour +':'+formattedMin
                    const newOption = {value:hora,label:hora}
                    list.push(newOption);
                    //console.log(list)
                } 
            }
        }

        setOption(options3.concat(list))
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

            const response = await axios.get('https://apis.dinossolutions.com/roni/torneos_list/',{ headers: headers }); // Reemplaza con la URL de tu API
             // Actualiza el estado de data con los datos de la API
            
            setData(response.data)
            setIsActive(false)           
            setInitialRecords(response.data)
            setRecordsData(response.data)

            setOptions([
                { value: 'Copa', label: 'Copa' },
                { value: 'Liga', label: 'Liga' },
            ]);

            setMod({ value: 'Liga', label: 'Liga' })

            setOptions2([        
                { value: 'Martes', label: 'Martes' },
                { value: 'Miercoles', label: 'Miercoles' },
                { value: 'Jueves', label: 'Jueves' },
                { value: 'Viernes', label: 'Viernes' },
                { value: 'Sabado', label: 'Sabado' },
                { value: 'Domingo', label: 'Domingo' },
            ]);

            setOptions4([
                { value: 'Veteranos', label: 'Veteranos' },
                { value: 'Libre', label: 'Libre' },
            ]);

            setCat({ value: 'Libre', label: 'Libre' })
           // console.log('list'+torneosList)
            //return torneosList
            //console.log(response)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    ///////////// AGREGAR/ACTUALIZAR TORNEOS/////////////////////////////////////////

    const [modalTitle, setTitle] = useState('Nuevo Torneo')

    const [idEdit, setId] = useState('');
    const [imgTorneo, setImg] = useState('');

    const [name, setName] = useState('');
    const [lugar, setlugar] = useState('');
    const [mod, setMod] = useState(null);
    const [temp, setTemp] = useState('');
    const [dias, setDias] = useState('');
    const [horarios, setHorarios] = useState('');
    const [fecha_in, setFechaIn] = useState<any>('2024-01-01');
    const [fecha_fin, setFechaFin] = useState<any>('2024-01-01');
    const [cat, setCat] = useState(null);
    const imgRef = useRef(null);

    const handleNameChange = (event: any) => {
        setName(event.target.value);
        
    };

    const handleLugarChange = (event: any) => {
        setlugar(event.target.value);
        
    };

    const handleModChange = (event: any) => {        
        setMod(event);
        
    };

    const handleTempChange = (event: any) => {
        setTemp(event.target.value);
        
    };

    const handleDiasChange = (event: any) => {
        console.log(diasList)
        var texto = "";
        Object.keys(event).map((key) => (
            //console.log(event[key].value.toString())
            texto += event[key].value.toString()+','
            
        ))
        console.log(texto.slice(0, -1))
        setDias(texto.slice(0, -1)) 
        setListDias(event)
    };

    const handleHorarioschange = (event: any) => {

        var texto = ""
        console.log(event)
        Object.keys(event).map((key) => (
            //console.log(event[key].value.toString())
            texto += event[key].value.toString()+','
            
        ))
        console.log(texto.slice(0, -1))
        setHorarios(texto.slice(0, -1));
        setListHoras(event)
    };

    const handleFechaInChange = (event: any) => {
        console.log(event.target.value)
        setFechaIn(event.target.value);
        
    };

    const handleFechaFinChange = (event: any) => {
        setFechaFin(event.target.value);
        
    };

    const handleCatChange = (event: any) => {
        setCat(event);
        
    };

    ///////////////////////rellenar formulario para editar/////////////////////////////////////////

    const editClick = async (id:any) => {

        setId(id);
        setModal9(true); 


        setTitle('Editar Torneo')
        console.log(idEdit)
        var token = await getToken()

        var headers = {
            'Content-Type': 'application/json', // Tipo de contenido de la solicitud
            'Authorization': 'Bearer ' + token, // Token de autorización, ajusta según tus necesidades
            'Access-Control-Allow-Origin': "*"
        };
        
       const resp = await axios.get('https://apis.dinossolutions.com/roni/admin/'+id+'/alpha_id',{headers:headers});

       var alpha_id = resp.data["alpha_id"]
        

        var url = 'https://apis.dinossolutions.com/roni/torneos' + '/' + alpha_id +'/id';

        try {
            const response = await axios.get(url,{headers:headers});
            console.log('Respuesta del servidor:', response.data);
            // Aquí puedes manejar la respuesta del servidor, como actualizar el estado de tu componente.
            if(response.status == 200) {    
                
                var datos = response.data

                const hour_list = []
                const dias_list = []

                const horas_select = datos.horarios_select
                const dias_select = datos.dias_select
                
                for(let option=0; option < horas_select.length; option++){
                    const newOption = {value:horas_select[option],label:horas_select[option]}
                    hour_list.push(newOption);
                }                 

                for(let option=0; option < dias_select.length; option++){
                    const newOption1 = {value:dias_select[option],label:dias_select[option]}
                    dias_list.push(newOption1);
                }

                console.log(dias_list)
                const image = myElementRef?.current;
                image.src = datos.img

                setName(datos.nombre_torneo);
                setlugar(datos.lugar);
                setMod({value:datos.modalidad,label:datos.modalidad});
                setTemp(datos.temporada);
                setDias(datos.dias);
                setHorarios(datos.horarios);
                setFechaIn(datos.fecha_inicio);
                setFechaFin(datos.fecha_fin);
                setCat({value:datos.categoria,label:datos.categoria});    
                setListDias(dias_list);
                setListHoras(hour_list);
                setImg(datos.img)     

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
        setTitle('Nuevo Torneo')
        setId('');
        setImg('');
        setName('');
        setlugar('');
        setMod(options[1]);
        setTemp('');
        setDias('');
        setHorarios('');
        setFechaIn('2024-01-01');
        setFechaFin('2024-01-01');
        setCat(options4[1]);
        setListDias([]);
        setListHoras([]);
      };



    //////////////////////////////////////////////////////////////////////////

    const guardaTorneo = async (event:any) =>{

        event.preventDefault();
        closeModal() 
        setIsActive(true)
        
        const formData = new FormData();

        formData.append('name', name);
        formData.append('lugar', lugar);
        formData.append('mod', mod.value);
        formData.append('temp', temp);
        formData.append('dias', dias);
        formData.append('horarios', horarios);
        formData.append('fecha_in', fecha_in);
        formData.append('fecha_fin', fecha_fin);
        formData.append('cat', cat.value);

        const data_torneo = {
            nombre_torneo: name,
            temporada:temp,
            modalidad: mod.value,
            lugar: lugar,
            dias: dias,
            horarios: horarios,
            fecha_inicio: fecha_in,
            fecha_fin: fecha_fin,
            categoria: cat.value,
            img: imgTorneo
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
            url = 'https://apis.dinossolutions.com/roni/torneos' + '/' + alpha_id;
            text = 'Tu torneo se edito correctamente';
        }else{
            url = 'https://apis.dinossolutions.com/roni/torneos/';
            text = 'Tu torneo se creo correctamente';
        }
    
        try {
            const response = await axios.post(url,data_torneo,{headers:headers});
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
                title: 'Deseas eliminar el torneo?',
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
                    
            
                    var url = 'https://apis.dinossolutions.com/roni/torneos/' + alpha_id +'/delete';

                    try {
                        const response = await axios.post(url,{id:alpha_id},{headers:headers});
                        console.log('Respuesta del servidor:', response.data);
                        // Aquí puedes manejar la respuesta del servidor, como actualizar el estado de tu componente.
                        if(response.status == 202) {  
                            fetchData() 
                            swalWithBootstrapButtons.fire('Eliminado!', 'El torneo se elimino.', 'success');
                        }
                    }catch (error) {
                        console.error(error); 
                    } 
            
                    
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    swalWithBootstrapButtons.fire('Cancelado', 'El torneo no se elimino', 'error');
                }
            });

    }


   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   
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
                                titleClassName: '!text-center',
                                sortable: true,
                                render: ({nombre_torneo,img}) => (
                                    <div className="flex items-center w-max">                                
                                        
                                        <img className="w-9 h-9 rounded-full ltr:mr-2 rtl:ml-2 object-cover" src={img} alt="" />
                                        {/* <div dangerouslySetInnerHTML={{ __html: img }}/> */}
                                        <div>{nombre_torneo} </div>
                                    </div>
                                ),
                            },  
                            { accessor: 'lugar', title: 'Lugar',titleClassName: '!text-center', sortable: true },     
                            { accessor: 'temporada', title: 'Temporada',titleClassName: '!text-center', sortable: true },       
                            { accessor: 'modalidad', title: 'Modalidad',titleClassName: '!text-center', sortable: true },  
                            { accessor: 'dias', title: 'Días',titleClassName: '!text-center', sortable: true },    
                            { accessor: 'horarios', title: 'Horarios',titleClassName: '!text-center', sortable: true },     
                            { accessor: 'fecha_inicio', title: 'Fecha Inicio',titleClassName: '!text-center', sortable: true }, 
                            { accessor: 'fecha_fin', title: 'Fecha Fin',titleClassName: '!text-center', sortable: true },  
                            { accessor: 'categoria', title: 'Categoria',titleClassName: '!text-center', sortable: true },
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
                                        <form onSubmit={guardaTorneo}>                                            
                                            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">                                                
                                                <div className='col-lg-6'>
                                                    <label htmlFor="name">Nombre</label>
                                                    <input value={name} onChange={handleNameChange} id="name" name="name" type="text" placeholder="Escriba nombre" className="form-input" />
                                                </div>
                                                <div>
                                                    <label htmlFor="lugar">Lugar</label>
                                                    <input value={lugar} onChange={handleLugarChange} id="lugar" name="lugar" type="text" placeholder="Escriba lugar" className="form-input" />
                                                </div>
                                                <div>
                                                    <label htmlFor="temp">Temporada</label>
                                                    <input value={temp} onChange={handleTempChange} id="temp" name="temp" type="text" placeholder="Escriba temporada" className="form-input" />
                                                </div>
                                                <div>
                                                    <label htmlFor="mod">Modalidad</label>
                                                    <Select onChange={handleModChange} value={mod} options={options} isSearchable={false} id="mod" name="mod"/>
                                                </div>
                                                <div>
                                                    <label htmlFor="dias">Dias</label>
                                                    <Select onChange={handleDiasChange} placeholder="Selecciona los dias" options={options2} value={diasList} isMulti isSearchable={false} id="dias" name="dias"/>
                                                </div>
                                                <div>
                                                    <label htmlFor="horarios">Horarios</label>
                                                    <Select onChange={handleHorarioschange} placeholder="Selecciona los horarios" options={options3} value={horariosList} isMulti isSearchable={false} id="horarios" name="horarios"/>
                                                </div>
                                                <div>
                                                    <label htmlFor="fecha_in">Fecha Inicio</label>
                                                    <input value={fecha_in} onChange={handleFechaInChange} id="fecha_in" name="fecha_in" type="date" className="form-input" />
                                                    {/* <Flatpickr options={{ dateFormat: 'Y-m-d',locale: 'es' }} id="fecha_in" name="fecha_in" value={fecha_in} onChange={(date) => handleFechaInChange(date)}  className="form-input"  /> */}
                                                </div>    
                                                <div>
                                                    <label htmlFor="fecha_fin">Fecha Fin</label>
                                                    <input value={fecha_fin} onChange={handleFechaFinChange} id="fecha_fin" name="fecha_fin" type="date" className="form-input" />
                                                    {/* <Flatpickr id="fecha_fin" name="fecha_fin" value={fecha_fin} onChange={handleFechaFinChange} options={{ dateFormat: 'Y-m-d',locale: 'es', position: isRtl ? 'auto right' : 'auto left' }} className="form-input" /> */}
                                                </div>   
                                                <div>
                                                    <label htmlFor="cat">Categoria</label>
                                                    <Select onChange={handleCatChange} value={cat} options={options4} isSearchable={false} id="cat" name="cat"/>
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
