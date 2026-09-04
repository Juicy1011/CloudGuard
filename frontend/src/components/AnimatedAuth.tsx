'use client';
import {
  memo,
  ReactNode,
  useState,
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  forwardRef,
} from 'react';
import Image from 'next/image';
import {
  motion,
  useAnimation,
  useInView,
  useMotionTemplate,
  useMotionValue,
} from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const Input = memo(
  forwardRef(function Input(
    { className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>,
    ref: React.ForwardedRef<HTMLInputElement>
  ) {
    const radius = 100;
    const [visible, setVisible] = useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({
      currentTarget,
      clientX,
      clientY,
    }: React.MouseEvent<HTMLDivElement>) {
      const { left, top } = currentTarget.getBoundingClientRect();

      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    }

    return (
      <motion.div
        style={{
          background: useMotionTemplate`
        radial-gradient(
          ${visible ? radius + 'px' : '0px'} circle at ${mouseX}px ${mouseY}px,
          #3b82f6,
          transparent 80%
        )
      `,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className='group/input rounded-lg p-[2px] transition duration-300'
      >
        <input
          type={type}
          className={cn(
            `shadow-input flex h-10 w-full rounded-md border-none bg-slate-900 px-3 py-2 text-sm text-slate-100 transition duration-400 group-hover/input:shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:ring-[2px] focus-visible:ring-blue-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 border border-slate-800`,
            className
          )}
          ref={ref}
          {...props}
        />
      </motion.div>
    );
  })
);

Input.displayName = 'Input';

type BoxRevealProps = {
  children: ReactNode;
  width?: string;
  boxColor?: string;
  duration?: number;
  overflow?: string;
  position?: string;
  className?: string;
};

const BoxReveal = memo(function BoxReveal({
  children,
  width = 'fit-content',
  boxColor,
  duration,
  overflow = 'hidden',
  position = 'relative',
  className,
}: BoxRevealProps) {
  const mainControls = useAnimation();
  const slideControls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      slideControls.start('visible');
      mainControls.start('visible');
    } else {
      slideControls.start('hidden');
      mainControls.start('hidden');
    }
  }, [isInView, mainControls, slideControls]);

  return (
    <section
      ref={ref}
      style={{
        position: position as
          | 'relative'
          | 'absolute'
          | 'fixed'
          | 'sticky'
          | 'static',
        width,
        overflow,
      }}
      className={className}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial='hidden'
        animate={mainControls}
        transition={{ duration: duration ?? 0.5, delay: 0.25 }}
      >
        {children}
      </motion.div>
      <motion.div
        variants={{ hidden: { left: 0 }, visible: { left: '100%' } }}
        initial='hidden'
        animate={slideControls}
        transition={{ duration: duration ?? 0.5, ease: 'easeIn' }}
        style={{
          position: 'absolute',
          top: 4,
          bottom: 4,
          left: 0,
          right: 0,
          zIndex: 20,
          background: boxColor ?? '#3b82f6',
          borderRadius: 4,
        }}
      />
    </section>
  );
});

type OrbitingCirclesProps = {
  className?: string;
  children: ReactNode;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
};

const OrbitingCircles = memo(function OrbitingCircles({
  className,
  children,
  reverse = false,
  duration = 20,
  delay = 10,
  radius = 50,
  path = true,
}: OrbitingCirclesProps) {
  return (
    <>
      {path && (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          version='1.1'
          className='pointer-events-none absolute inset-0 size-full'
        >
          <circle
            className='stroke-slate-700/40 stroke-1'
            cx='50%'
            cy='50%'
            r={radius}
            fill='none'
          />
        </svg>
      )}
      <section
        style={
          {
            '--duration': duration,
            '--radius': radius,
            '--delay': -delay,
          } as React.CSSProperties
        }
        className={cn(
          'absolute flex size-full transform-gpu animate-orbit items-center justify-center rounded-full border bg-slate-800/40 [animation-delay:calc(var(--delay)*1000ms)] border-slate-700/50',
          { '[animation-direction:reverse]': reverse },
          className
        )}
      >
        {children}
      </section>
    </>
  );
});

type FieldType = 'text' | 'email' | 'password';

type Field = {
  label: string;
  required?: boolean;
  type: FieldType;
  placeholder?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

type AnimatedFormProps = {
  header: string;
  subHeader?: string;
  fields: Field[];
  submitButton: string;
  textVariantButton?: string;
  errorField?: string;
  fieldPerRow?: number;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  googleLogin?: string;
  goTo?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

type Errors = {
  [key: string]: string;
};

const AnimatedForm = memo(function AnimatedForm({
  header,
  subHeader,
  fields,
  submitButton,
  textVariantButton,
  errorField,
  fieldPerRow = 1,
  onSubmit,
  googleLogin,
  goTo,
}: AnimatedFormProps) {
  const [visible, setVisible] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});

  const toggleVisibility = () => setVisible(!visible);

  const validateForm = (event: FormEvent<HTMLFormElement>) => {
    const currentErrors: Errors = {};
    fields.forEach((field) => {
      const value = (event.target as HTMLFormElement)[field.label]?.value;

      if (field.required && !value) {
        currentErrors[field.label] = `${field.label} is required`;
      }

      if (field.type === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
        currentErrors[field.label] = 'Invalid email address';
      }

      if (field.type === 'password' && value && value.length < 6) {
        currentErrors[field.label] =
          'Password must be at least 6 characters long';
      }
    });
    return currentErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formErrors = validateForm(event);

    if (Object.keys(formErrors).length === 0) {
      onSubmit(event);
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <section className='max-md:w-full flex flex-col gap-4 w-96 mx-auto'>
      <BoxReveal boxColor='#3b82f6' duration={0.3}>
        <h2 className='font-bold text-3xl text-slate-100'>
          {header}
        </h2>
      </BoxReveal>

      {subHeader && (
        <BoxReveal boxColor='#3b82f6' duration={0.3} className='pb-2'>
          <p className='text-slate-400 text-sm max-w-sm'>
            {subHeader}
          </p>
        </BoxReveal>
      )}

      {googleLogin && (
        <>
          <BoxReveal
            boxColor='#3b82f6'
            duration={0.3}
            overflow='visible'
            width='unset'
          >
            <button
              className='g-button group/btn bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 text-slate-200 w-full rounded-md h-10 font-medium outline-hidden hover:cursor-pointer relative overflow-hidden transition-all'
              type='button'
              onClick={() => alert("Google SSO is disabled in local demo mode.")}
            >
              <span className='flex items-center justify-center w-full h-full gap-3 text-sm'>
                <Image
                  src='https://cdn.21st.dev/assets/mirror/89/8948eafec4a9c68b2b3a78a756b4474c05e53431f208149556fb669e3c429be2.png'
                  width={20}
                  height={20}
                  alt='Google Icon'
                />
                {googleLogin}
              </span>
              <BottomGradient />
            </button>
          </BoxReveal>

          <BoxReveal boxColor='#3b82f6' duration={0.3} width='100%'>
            <section className='flex items-center gap-4'>
              <hr className='flex-1 border-1 border-dashed border-slate-800' />
              <p className='text-slate-500 text-sm'>or</p>
              <hr className='flex-1 border-1 border-dashed border-slate-800' />
            </section>
          </BoxReveal>
        </>
      )}

      <form onSubmit={handleSubmit}>
        <section className={`grid grid-cols-1 md:grid-cols-${fieldPerRow} mb-4`}>
          {fields.map((field) => (
            <section key={field.label} className='flex flex-col gap-2'>
              <BoxReveal boxColor='#3b82f6' duration={0.3}>
                <Label htmlFor={field.label} className="text-slate-300">
                  {field.label} {field.required && <span className='text-red-500'>*</span>}
                </Label>
              </BoxReveal>

              <BoxReveal
                width='100%'
                boxColor='#3b82f6'
                duration={0.3}
                className='flex flex-col space-y-2 w-full'
              >
                <section className='relative'>
                  <Input
                    name={field.label}
                    type={
                      field.type === 'password'
                        ? visible
                          ? 'text'
                          : 'password'
                        : field.type
                    }
                    id={field.label}
                    placeholder={field.placeholder}
                    onChange={field.onChange}
                  />

                  {field.type === 'password' && (
                    <button
                      type='button'
                      onClick={toggleVisibility}
                      className='absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-slate-400 hover:text-slate-200'
                    >
                      {visible ? (
                        <Eye className='h-5 w-5' />
                      ) : (
                        <EyeOff className='h-5 w-5' />
                      )}
                    </button>
                  )}
                </section>

                <section className='h-4'>
                  {errors[field.label] && (
                    <p className='text-red-400 text-xs'>
                      {errors[field.label]}
                    </p>
                  )}
                </section>
              </BoxReveal>
            </section>
          ))}
        </section>

        <BoxReveal width='100%' boxColor='#3b82f6' duration={0.3}>
          {errorField && (
            <p className='text-red-400 text-sm mb-4'>{errorField}</p>
          )}
        </BoxReveal>

        <BoxReveal
          width='100%'
          boxColor='#3b82f6'
          duration={0.3}
          overflow='visible'
        >
          <button
            className='bg-blue-600 hover:bg-blue-500 text-white transition-colors relative group/btn block w-full rounded-md h-10 font-medium shadow-lg shadow-blue-500/20 outline-hidden hover:cursor-pointer'
            type='submit'
          >
            {submitButton} &rarr;
            <BottomGradient />
          </button>
        </BoxReveal>

        {textVariantButton && goTo && (
          <BoxReveal boxColor='#3b82f6' duration={0.3}>
            <section className='mt-4 text-center hover:cursor-pointer'>
              <button
                type='button'
                className='text-sm text-blue-400 hover:text-blue-300 transition-colors outline-hidden'
                onClick={goTo}
              >
                {textVariantButton}
              </button>
            </section>
          </BoxReveal>
        )}
      </form>
    </section>
  );
});

const BottomGradient = () => {
  return (
    <>
      <span className='group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent' />
      <span className='group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-cyan-500 to-transparent' />
    </>
  );
};

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
}

const Label = memo(function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  );
});

export {
  Input,
  BoxReveal,
  OrbitingCircles,
  AnimatedForm,
  Label,
  BottomGradient,
};
