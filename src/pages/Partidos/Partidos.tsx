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
import IconMinus from '../../components/Icon/IconMinus';
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

    const [partidosList, setData] = useState([]);
    const [torneosList, setDataTorneos] = useState([]);
    const [torneosListForm, setDataTorneosForm] = useState([]);
    const [equiposListForm, setDataEquipossForm] = useState([]);
    const [initialRecords, setInitialRecords] = useState(partidosList);
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
        //getEquipos();
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
        if (inputSearch != ""){
            setIsActive(false) 
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
            
            var url = 'https://apis.dinossolutions.com/roni/admin/'+idEdit+'/alpha_id'
               
            
            const response = await axios.get(url,{headers:headers});

            if(response.status === 200) {      
        
                var alpha_id = response.data["alpha_id"]
               // console.log("Token_resp: "+token_resp)
                return alpha_id;             
    
            } 
        }catch (error) {
            console.error('Error fetching data:', error);
        }

        
    }

    ////////////////////////ALPHA CON ID/////////////////////////////////////////////////////

    const getAlphaId = async (id:any) => {

        try{
            let value = await  getToken();
            var headers = {
                'Content-Type': 'application/json', // Tipo de contenido de la solicitud
                'Authorization': 'Bearer ' + value, // Token de autorización, ajusta según tus necesidades
                'Access-Control-Allow-Origin': "*"
            };
            
            var url = 'https://apis.dinossolutions.com/roni/admin/'+id+'/alpha_id'
                
            
            const response = await axios.get(url,{headers:headers});

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

            const response = await axios.get('https://apis.dinossolutions.com/roni/partidos_list/',{ headers: headers }); // Reemplaza con la URL de tu API
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
                //setPage(1);               
                               
                //setTorneo(torneosList[0])
                //inputSearchRef.current.click()
                //setIsActive(false) 
            }
            //handleTorneoChange(torneo)

            /* setPage(1)
            setSearchSelect(torneo.label) */
            //aplyFilter()
            //console.log('list'+JSON.stringify(response.data))
            return partidosList
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
            
            getEquipos(tor_list[0].value)
            //setSearchSelect(torneosList[0].value)
            //setIsActive(false) 
        } catch (error) { 
            console.error('Error fetching data:', error);
        }
    };


      //////////////////////////////////////OBTENER EQUIPOS///////////////////////////////////////////////////////

      const getEquipos = async (id:any) => {
        try {

            let value = await  getToken();
            //console.log("Token :" + value)
            var headers = {
                'Content-Type': 'application/json', // Tipo de contenido de la solicitud
                'Authorization': 'Bearer ' + value, // Token de autorización, ajusta según tus necesidades
                'Access-Control-Allow-Origin': "*"
            };

            var alpha_id = await getAlphaId(id);

            const response = await axios.get('https://apis.dinossolutions.com/roni/equipos/'+alpha_id+'/id_torneo',{ headers: headers }); // Reemplaza con la URL de tu API
             // Actualiza el estado de data con los datos de la API
             const eq_list = []
             const eq_listForm = []

             const equipos = response.data
             
             
             for(let option=0; option < equipos.length; option++){
                 const newOption = {value:equipos[option].nombre,label:equipos[option].nombre}
                 const newOptionForm = {value:equipos[option].id,label:equipos[option].nombre}
                 eq_list.push(newOption);
                 eq_listForm.push(newOptionForm);
             }
            //setDataTorneos(eq_list)    
            setDataEquipossForm(eq_listForm)         
            setEquipo(eq_listForm[0])
            //setTorneoForm(eq_listForm[0])
            //setInputSearch(eq_list[0].value)
            
            //inputSearchRef.current.click()
            //setIsActive(false) 
            //setSearchSelect(torneosList[0].value)
            
        } catch (error) { 
            console.error('Error fetching data:', error);
        }
    };


    ///////////// AGREGAR/ACTUALIZAR TORNEOS/////////////////////////////////////////

    const [modalTitle, setTitle] = useState('Nuevo Jugador')

    const [idEdit, setId] = useState('');
    const [imgJugador, setImg] = useState('');

    const [name, setName] = useState('');
    const [app, setApp] = useState('');
    const [apm, setApm] = useState('');
    const [edad, setEdad] = useState<any>(0);
    const [liga, setLiga] = useState('');
    const [equipo, setEquipo] = useState(null);
    const [expediente, setExp] = useState('');
    const [seccional, setSecc] = useState('');
    const [domicilio, setDomicilio] = useState('');
    const [telefono, setTel] = useState('');
    const [delegado, setDelegado] = useState(null);
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
        //setId(event.value)  
        console.log(event)     
        getEquipos(event.value)
    };
    

    const handleNameChange = (event: any) => {
        setName(event.target.value);
        
    };

    const handleAppChange = (event: any) => {
        setApp(event.target.value);
        
    };

    const handleApmChange = (event: any) => {
        setApm(event.target.value);
        
    };

    const handleEdadChange = (event: any) => {
        console.log(event)
        setEdad(event.target.value);
        
    };


    const handleEquipoChange = (event: any) => {
        console.log(event)
        setEquipo(event);
        
    };

    const handleExpChange = (event: any) => {
        setExp(event.target.value);
        
    };

    const handleSeccChange = (event: any) => {
        setSecc(event.target.value);
        
    };

    const handleDomicilioChange = (event: any) => {
        setDomicilio(event.target.value);
        
    };

    const handleTelChange = (event: any) => {
        setTel(event.target.value);
        
    };

    const handleDelegadoChange = (event: any) => {
        console.log(event.target.checked)
        setDelegado(event.target.checked);
        
    };

    const handleEstatusChange = (event: any) => {        
        setEstatus(event);
        console.log(event)   
    };

   

  
    ///////////////////////rellenar formulario para editar/////////////////////////////////////////

    const editClick = async (id:any) => {

        setId(id);
        setModal9(true); 


        setTitle('Editar Jugador')
        console.log(idEdit)
        var token = await getToken()

        var headers = {
            'Content-Type': 'application/json', // Tipo de contenido de la solicitud
            'Authorization': 'Bearer ' + token, // Token de autorización, ajusta según tus necesidades
            'Access-Control-Allow-Origin': "*"
        };
        
        const resp = await axios.get('https://apis.dinossolutions.com/roni/admin/'+id+'/alpha_id',{headers:headers});

        var alpha_id = resp.data["alpha_id"]
        

        var url = 'https://apis.dinossolutions.com/roni/jugadores' + '/' + alpha_id +'/id';

        try {
            const response = await axios.get(url,{headers:headers});
            console.log('Respuesta del servidor:', response.data);
            // Aquí puedes manejar la respuesta del servidor, como actualizar el estado de tu componente.
            if(response.status == 200) {    
                
                var datos = response.data              
        
                const image = myElementRef?.current;
                image.src = datos.img
                let est = datos.estatus.toString()
                
                if(est == '1'){
                   setEstatus(options[0]);
                }else{
                    setEstatus(options[1]);
                }

                setName(datos.nombre);
                setApp(datos.ap_p);
                setApm(datos.ap_m);
                setEdad(datos.edad)
                setTorneoForm({label:datos.equipo_jugador.liga_equipo.nombre_torneo,value:datos.liga});
                setEquipo({label:datos.equipo_jugador.nombre,value:datos.equipo});
                setExp(datos.expediente)
                setSecc(datos.seccional)
                setDomicilio(datos.direccion)
                setTel(datos.telefono)
                setDelegado(datos.delegado);
                              
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
        setTitle('Nuevo Equipo')
        setId('');
        setImg('');
        setName('');
        setApp('');
        setApm('');
        setExp('');
        setSecc('');
        setTel('');
        setDomicilio('');
        setEdad(0);
        setTorneoForm(torneosList[0])
        getEquipos(torneosList[0].value)
        setDelegado(false)
        setEstatus('1')
      };



    //////////////////////////////////////////////////////////////////////////

    const guardaEquipo = async (event:any) =>{

        event.preventDefault();
        closeModal() 
        setIsActive(true)
        
        const formData = new FormData();

        formData.append('name', name);
        formData.append('app', app);
        formData.append('apm', apm);
        formData.append('edad', edad);
        formData.append('liga', torneoForm);
        formData.append('equipo', equipo);
        formData.append('exp', expediente);
        formData.append('secc', seccional);
        formData.append('dom', domicilio);
        formData.append('tel', telefono);
        formData.append('estatus', estatus.value);

        var del = false

        if(delegado != null){

            del = delegado
        }
        
        const data_jugador = {
            nombre: name,
            ap_p: app,
            ap_m: apm,
            edad:parseInt(edad),
            liga: torneoForm.value,
            equipo: equipo.value,
            dorsal: 0,
            expediente:expediente,
            seccional: seccional,
            direccion: domicilio,
            telefono: telefono,
            img: imgJugador,            
            delegado: del,
            estatus: parseInt(estatus.value),           
            
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
            url = 'https://apis.dinossolutions.com/roni/jugadores' + '/' + alpha_id;
            text = 'El jugador se edito correctamente';
        }else{
            url = 'https://apis.dinossolutions.com/roni/jugadores/';
            text = 'El jugador se creo correctamente';
        }
    
        try {
            const response = await axios.post(url,data_jugador,{headers:headers});
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

            window.location.reload();
            
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
                title: 'Deseas eliminar este Jugador?',
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
                    
            
                    var url = 'https://apis.dinossolutions.com/roni/jugadores/' + alpha_id +'/delete';

                    try {
                        const response = await axios.post(url,{id:alpha_id},{headers:headers});
                        console.log('Respuesta del servidor:', response.data);
                        // Aquí puedes manejar la respuesta del servidor, como actualizar el estado de tu componente.
                        if(response.status == 202) {  
                            setIsActive(true)
                            swalWithBootstrapButtons.fire('Eliminado!', 'El jugador se elimino.', 'success');
                            //fetchData() 
                            
                        }
                        window.location.reload();
                    }catch (error) {
                        console.error(error); 
                    } 
            
                    
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    swalWithBootstrapButtons.fire('Cancelado', 'El jugador no se elimino', 'error');
                }
            });

    }


   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   
    useEffect(() => {
        //console.log('ejecuto dispatch')
        dispatch(setPageTitle('Partidos / Resultados'));
        //fetchData();
    });

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [5,10,15];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    /* const [initialRecords, setInitialRecords] = useState(partidosList);
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

    //console.log(partidosList)

    useEffect(() => {
        setInitialRecords(() => {
            return partidosList.filter((item:any) => { 
                return (
                    //console.log(item.nombre_torneo)
                    item.horario.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.etapa_descripcion.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.jornada.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.campo.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.liga_partido.nombre_torneo.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.nombre_local.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.nombre_visitante.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.temporada.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.ganador_descripcion.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.observaciones.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.estatus.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.ganador.toString().toLowerCase().includes(searchSelect.toLowerCase())  
                    //item.estatus.toLowerCase().includes(search.toLowerCase()) 
                     
                );
            });
        });
       // console.log('initialRecords')
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]); 

    useEffect(() => {
        setInitialRecords(() => {
            return partidosList.filter((item:any) => { 
                return (
                    //console.log(item.nombre_torneo)                    
                    item.fecha.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.horario.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.etapa_descripcion.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.jornada.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.campo.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.liga_partido.nombre_torneo.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.nombre_local.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.nombre_visitante.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.temporada.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.ganador_descripcion.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.observaciones.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.estatus.toString().toLowerCase().includes(searchSelect.toLowerCase()) ||
                    item.ganador.toString().toLowerCase().includes(searchSelect.toLowerCase())  
                    //item.estatus.toLowerCase().includes(search.toLowerCase()) 
                     
                );
            });
        });
        //console.log('initialrecords2')
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchSelect]); 

    useEffect(() => {
        //console.log('ordena columnas')
        const data = sortBy(partidosList, sortStatus.columnAccessor);
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
                    <h1 className="font-semibold text-lg dark:text-white-light">Partidos / Resultados</h1>
                    <button onClick={() => setModal9(true)} type="button" className="btn btn-success w-10 h-10 p-0 rounded-full">
                        <IconPlus className="w-6 h-6" />
                    </button>
                    <div className='col-lg-2'>                        
                        <Select onChange={(e) => handleTorneoChange(e)}  className='z-[999] col-lg-2' placeholder="select-filtro" value={torneo} options={torneosList} isSearchable={false} id="torneo" name="torneo"/>
                    </div>
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input type="text" className="form-input w-auto" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        <input type="text" className="form-input w-auto" placeholder="Buscar..." value={inputSearch} ref={inputSearchRef} id="input_search" onClick={aplyFilter} hidden />

                    </div>
                </div>
                <div className="datatables">
                    <DataTable
                        
                        className="whitespace-nowrap table-hover"
                        records={recordsData}                        
                        columns={[
                            //{
                            //    accessor: 'img',
                            //    title: 'Foto',
                            //    cellsClassName: 'text-center',
                            //    sortable: true,
                            //    render: ({img}) => (
                            //        <div className="flex items-center w-max">                                
                            //            
                            //            <img className="w-9 h-9 rounded-full ltr:mr-2 rtl:ml-2 object-cover" src={img} alt="" />
                            //            {/* <div dangerouslySetInnerHTML={{ __html: img }}/> */}
                            //            {/* <div>{nombre+' '+ap_p+' '+ap_m}</div> */}
                            //        </div>
                            //    ),
                            //}, 
                            {
                                accessor: 'fecha',
                                title: 'Fecha',
                                cellsClassName: 'text-center',
                                titleClassName: 'text-center',
                                sortable: true,
                                //render: ({nombre,ap_p,ap_m,img}) => (
                                //    <div className="flex items-center w-max">                                
                                //        
                                //        {/* <img className="w-9 h-9 rounded-full ltr:mr-2 rtl:ml-2 object-cover" src={img} alt="" /> */}
                                //        {/* <div dangerouslySetInnerHTML={{ __html: img }}/> */}
                                //        <div>{nombre+' '+ap_p+' '+ap_m}</div>
                                //    </div>
                                //),
                            },  
                            { accessor: 'horario', title: 'Horario',cellsClassName: 'text-center', sortable: true },   
                            { accessor: 'etapa_descripcion', title: 'Etapa',cellsClassName: 'text-center', sortable: true }, 
                            { accessor: 'jornada', title: 'Jornada',cellsClassName: 'text-center', sortable: true },   
                            { accessor: 'campo', title: 'Campo',cellsClassName: '!text-center', sortable: true },                 
                            { accessor: 'liga_partido.nombre_torneo', title: 'Liga',titleClassName: 'text-center',cellsClassName: 'text-center', sortable: true }, 
                            {
                                accessor: 'nombre_local',
                                title: 'Local',
                                cellsClassName: 'text-center !text-lowercase',
                                sortable: true,
                                render: ({nombre_local,img_local}) => (
                                    <div className='flex items-center md-2 w-max'>
                                        <img className="w-9 h-9 rounded-full ltr:mr-2 rtl:ml-2 object-cover" src={img_local} alt="" />
                                        <p>{nombre_local}</p>
                                    </div>
                                    
                                ),
                            },                               
                            { accessor: 'estatus',
                              title: '-',
                              titleClassName: '!text-center',
                              sortable: true,
                              render: ({estatus,goles_local,goles_visitante}) => (  
                                
                                
                                                             
                                <div >                           
                                    <div>
                                        <span>{estatus === 1 ? 'VS': estatus === 2 ? goles_local + ' - ' + goles_visitante :'-'}</span>
                                    </div>
                                </div>
                             ),  
                            
                            }, 
                            {
                                accessor: 'nombre_visitante',
                                title: 'Visitante',
                                cellsClassName: '!text-center !text-lowercase',
                                sortable: true,
                                render: ({nombre_visitante,img_visitante}) => (
                                    <div className='flex items-center md-2 w-max'>
                                        <p className='ltr:mr-2 rtl:ml-2'>{nombre_visitante}</p>
                                        <img className="w-9 h-9 rounded-full object-cover" src={img_visitante} alt="" />
                                        
                                    </div>
                                ),
                            }, 
                            { accessor: 'temporada', title: 'Temporada',cellsClassName: 'text-center', sortable: true },  
                            { accessor: 'ganador_descripcion', title: 'Ganador',cellsClassName: 'text-center', sortable: true },  
                            { accessor: 'estatus_descripcion', title: 'Estatus',cellsClassName: 'text-center', sortable: true },
                            { accessor: 'observaciones', title: 'Observaciones',cellsClassName: 'text-center', sortable: true },
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
                                                <div className='col-lg-6'>
                                                    <label htmlFor="name">Apellido Paterno</label>
                                                    <input value={app} onChange={handleAppChange} id="app" name="app" type="text" placeholder="Escriba apellido paterno" className="form-input" />
                                                </div>
                                                <div className='col-lg-6'>
                                                    <label htmlFor="name">Apellido Materno</label>
                                                    <input value={apm} onChange={handleApmChange} id="apm" name="apm" type="text" placeholder="Escriba apellido materno" className="form-input" />
                                                </div>

                                                {/* Input NUmber */}
                                                <div className="mb-1">
                                                    <div className="mb-1">
                                                        <label htmlFor="edad">Edad</label>
                                                        <div className="inline-flex">                                                            
                                                            <button
                                                                type="button"
                                                                className="bg-primary text-white flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border border-r-0 border-primary"
                                                                onClick={() => setEdad(edad > 0 ? edad - 1 : 0)}
                                                            >
                                                                <IconMinus className="w-5 h-5" />
                                                            </button>
                                                            <input type="number" onChange={handleEdadChange} placeholder="55" className="form-input rounded-none text-center" id="edad" name="edad" min="0" max="60" value={edad} />
                                                            <button
                                                                type="button"
                                                                className="bg-primary text-white flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border border-l-0 border-primary"
                                                                onClick={() => setEdad(edad < 60 ? edad + 1 : 60)}
                                                            >
                                                                <IconPlus />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* End input number */}
                                                <div>
                                                    <label htmlFor="liga">Liga</label>
                                                    <Select onChange={(e) => handleTorneoFormChange(e)}  className='z-[999] col-lg-2' placeholder="select-filtro" value={torneoForm} options={torneosListForm} isSearchable={false} id="liga" name="liga"/>
                                                </div>
                                                <div>
                                                    <label htmlFor="liga">Equipo</label>
                                                    <Select onChange={(e) => handleEquipoChange(e)}  className='z-[999] col-lg-2' placeholder="select-filtro" value={equipo} options={equiposListForm} isSearchable={false} id="liga" name="liga"/>
                                                </div>
                                                <div className='col-lg-6'>
                                                    <label htmlFor="exp">Expediente</label>
                                                    <input value={expediente} onChange={handleExpChange} id="exp" name="exp" type="text" placeholder="Escriba expediente" className="form-input" />
                                                </div>
                                                <div className='col-lg-6'>
                                                    <label htmlFor="secc">Seccional</label>
                                                    <input value={seccional} onChange={handleSeccChange} id="secc" name="secc" type="text" placeholder="Escriba seccional" className="form-input" />
                                                </div>
                                                <div className='col-lg-6'>
                                                    <label htmlFor="tel">Telefono</label>
                                                    <input value={telefono} onChange={handleTelChange} id="tel" name="tel" type="text" placeholder="Escriba telefono" className="form-input" />
                                                </div>
                                                <div>
                                                    <label htmlFor="delegado">Delegado</label>
                                                    <label className="w-12 h-6 relative">
                                                        <input type="checkbox" checked={delegado} onChange={(e) => handleDelegadoChange(e)} id="delegado" name="delegado" className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" />
                                                        <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                                                    </label>                                                    
                                                </div>
                                                <div>
                                                    <label htmlFor="estatus">Estatus</label>
                                                    <Select onChange={(e) => handleEstatusChange(e)} value={estatus}  options={options} isSearchable={false} id="estatus" name="estatus"/>
                                                </div>   
                                                <div className='col-lg-6'>
                                                    <label htmlFor="tel">Domicilio</label>
                                                    <textarea rows={4} value={domicilio} onChange={handleDomicilioChange} id="dom" name="dom" className="form-textarea ltr:rounded-l-none rtl:rounded-r-none"></textarea>
                                                    
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
