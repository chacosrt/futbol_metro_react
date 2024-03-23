import { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setPageTitle, toggleRTL } from '../../store/themeConfigSlice';
import Dropdown from '../../components/Dropdown';
import { IRootState } from '../../store';
import i18next from 'i18next';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import IconMail from '../../components/Icon/IconMail';
import IconLockDots from '../../components/Icon/IconLockDots';
import IconInstagram from '../../components/Icon/IconInstagram';
import IconFacebookCircle from '../../components/Icon/IconFacebookCircle';
import IconTwitter from '../../components/Icon/IconTwitter';
import IconGoogle from '../../components/Icon/IconGoogle';


const LoginCover = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Login'));
    });
    const navigate = useNavigate();
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const setLocale = (flag: string) => {
        setFlag(flag);
        if (flag.toLowerCase() === 'ae') {
            dispatch(toggleRTL('rtl'));
        } else {
            dispatch(toggleRTL('ltr'));
        }
    };
    const [flag, setFlag] = useState(themeConfig.locale);

    const [pass, setPass] = useState('');
    const [email, setEmail] = useState('');

    const handlePassChange = (event: any) => {
        setPass(event.target.value);
        
    };

    const handleEmailChange = (event: any) => {
        setEmail(event.target.value);
        
    };

    

    const submitForm = async (event: any) => {

        event.preventDefault();

        const formData = new FormData();
        
        formData.append('password', pass);
        formData.append('username', email);

        if(pass === '' ) {

            toastr.error('Ingresa una clave valida', '¡Datos Invalidos!');
      
            return;
      
        }

        var headers = {
            'Content-Type': 'application/x-www-form-urlencoded', // Tipo de contenido de la solicitud
            'Access-Control-Allow-Origin': "*"
          };
        
        try {
            const response = await axios.post('https://apis.dinossolutions.com/janus/sentry', formData,{headers:headers});
            console.log('Respuesta del servidor:', response.data);
            // Aquí puedes manejar la respuesta del servidor, como actualizar el estado de tu componente.
            if(response.status === 200) {      
          
                const decoded = response.data;
                
                
                sessionStorage.setItem('usuario', decoded["nombre"]);
                sessionStorage.setItem('email', decoded["email"]);
                sessionStorage.setItem('roles', decoded["roles"]);
      
                console.log("hola",sessionStorage.getItem("usuario"));
                navigate('/sales');              
      
              } 
              else { toastr.error(response.statusText, '¡Upss!'); }
          } catch (error) {
            toastr.error('Favor validar las credenciales de acceso'); 
          }
        
    };

    return (
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images_metro/futbol1.jpg" alt="image" className="h-full w-full object-cover" />
            </div>
            <div className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                <img src="/assets/images/auth/coming-soon-object1.png" alt="image" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
                
               {/*  <img src="/assets/images/auth/coming-soon-object3.png" alt="image" className="absolute right-0 top-0 h-[300px]" /> */}
                
                <div className="relative flex w-full max-w-[1502px] flex-col bg-transparent justify-between overflow-hidden rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 lg:min-h-[700px] lg:flex-row lg:gap-10 xl:gap-0">
                    <div className="relative hidden w-full items-center justify-center bg-[linear-gradient(225deg,rgba(255,255,255)_0%,rgba(48,42,117)_100%)] p-5 lg:inline-flex lg:max-w-[835px] xl:-ms-28 ltr:xl:skew-x-[14deg] rtl:xl:skew-x-[-14deg]">
                        <div className="absolute inset-y-0 w-8 from-primary/10 via-transparent to-transparent ltr:-right-10 ltr:bg-gradient-to-r rtl:-left-10 rtl:bg-gradient-to-l xl:w-16 ltr:xl:-right-20 rtl:xl:-left-20"></div>
                        <div className="ltr:xl:-skew-x-[14deg] rtl:xl:skew-x-[14deg]">
                            <Link to="/" className="w-30 h-30 block lg:w-72 ms-10">
                                <img src="/assets/images_metro/logo.png" width="50" height="50" alt="Logo" className="w-full" />
                            </Link>
                            <div className="mt-30 ml-auto  w-80 max-w-[430px] lg:block">
                                <img src="/assets/images_metro/jugador2.png" alt="Cover Image" className="w-full" />
                            </div>
                        </div>
                    </div>
                    <div className="relative flex w-full flex-col items-center justify-center gap-6 px-4 pb-16 pt-6 sm:px-6 lg:max-w-[667px]">
                        <div className="flex w-full max-w-[440px] items-center gap-2 lg:absolute lg:end-6 lg:top-6 lg:max-w-full">
                            <Link to="/" className="w-8 block lg:hidden">
                                <img src="/assets/images/logo.svg" alt="Logo" className="mx-auto w-10" />
                            </Link>
                            {/* <div className="dropdown ms-auto w-max">
                                <Dropdown
                                    offset={[0, 8]}
                                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                    btnClassName="flex items-center gap-2.5 rounded-lg border border-white-dark/30 bg-white px-2 py-1.5 text-white-dark hover:border-primary hover:text-primary dark:bg-black"
                                    button={
                                        <>
                                            <div>
                                                <img src={`/assets/images/flags/${flag.toUpperCase()}.svg`} alt="image" className="h-5 w-5 rounded-full object-cover" />
                                            </div>
                                            <div className="text-base font-bold uppercase">{flag}</div>
                                            <span className="shrink-0">
                                                <IconCaretDown />
                                            </span>
                                        </>
                                    }
                                >
                                    <ul className="!px-2 text-dark dark:text-white-dark grid grid-cols-2 gap-2 font-semibold dark:text-white-light/90 w-[280px]">
                                        {themeConfig.languageList.map((item: any) => {
                                            return (
                                                <li key={item.code}>
                                                    <button
                                                        type="button"
                                                        className={`flex w-full hover:text-primary rounded-lg ${flag === item.code ? 'bg-primary/10 text-primary' : ''}`}
                                                        onClick={() => {
                                                            i18next.changeLanguage(item.code);
                                                            // setFlag(item.code);
                                                            setLocale(item.code);
                                                        }}
                                                    >
                                                        <img src={`/assets/images/flags/${item.code.toUpperCase()}.svg`} alt="flag" className="w-5 h-5 object-cover rounded-full" />
                                                        <span className="ltr:ml-3 rtl:mr-3">{item.name}</span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </Dropdown>
                            </div> */}
                        </div>
                        <div className="w-full max-w-[440px] lg:mt-16">
                            <div className="mb-10">
                                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Inicia Sesion</h1>
                                
                            </div>
                            <form className="space-y-5 dark:text-white ingresar" onSubmit={submitForm}>
                                <div>
                                    <label htmlFor="email">Email</label>
                                    <div className="relative text-white-dark">
                                        <input id="email" name="email" type="email" placeholder="Ingresa tu correo" value={email} onChange={handleEmailChange} className="form-input ps-10 placeholder:text-white-dark" />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconMail fill={true} />
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="pass">Contraseña</label>
                                    <div className="relative text-white-dark">
                                        <input id="pass" name="pass" type="password" placeholder="Ingresa Contrasña" value={pass} onChange={handlePassChange} className="form-input ps-10 placeholder:text-white-dark" />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconLockDots fill={true} />
                                        </span>
                                    </div>
                                </div>                            
                                <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                                   Ingresar
                                </button>
                            </form>                           
                            
                            <div className="text-center dark:text-white">
                               Olvidaste tu contrasea ?&nbsp;
                                <Link to="/auth/cover-register" className="uppercase text-primary underline transition hover:text-black dark:hover:text-white">
                                    Click Aqui
                                </Link>
                            </div>
                        </div>
                        <p className="absolute bottom-6 w-full text-center dark:text-white">© {new Date().getFullYear()}. Sindicato Nacional de Trabajadores del Sistema de Transporte Colectivo..</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginCover;
