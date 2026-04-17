"use client"
import React, { useEffect } from 'react';
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import type { IconType } from 'react-icons';

interface SocialNetwork {
  name: string;
  username: string;
  url: string;
  color: string;
  Icon: IconType;
}

const RedesSociales: React.FC = () => {
  const socialNetworks: SocialNetwork[] = [
    {
      name: 'Facebook',
      username: '@360conexion',
      url: 'https://www.facebook.com/360conexion',
      color: 'bg-[#1877F2]',
      Icon: FaFacebook,
    },
    {
      name: 'Instagram',
      username: '@conexion360sac',
      url: 'https://www.instagram.com/conexion360sac/',
      color: 'bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5]',
      Icon: FaInstagram,
    },
    {
      name: 'TikTok',
      username: '@conexion360.sac',
      url: 'https://www.tiktok.com/@conexion360.sac',
      color: 'bg-black',
      Icon: FaTiktok,
    },
  ];

  const openSocial = (url: string) => {
    window.open(url, '_blank');
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="redes-sociales" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-primary-dark">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,205,208,0.08),transparent_40%)]"></div>
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="text-center mb-16 reveal-on-scroll">
          <h2 className="text-5xl sm:text-6xl font-bold mb-6">
            <span className="text-white">Nuestras</span>
            <span className="text-secondary ml-2">Redes Sociales</span>
          </h2>
          <p className="text-gray-300 max-w-3xl mx-auto text-lg mt-4">
            Mantente conectado con nosotros y entérate de todos nuestros eventos.
            Síguenos en nuestras plataformas para no perderte nuestra música.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {socialNetworks.map((network, index) => {
            const { Icon } = network;
            return (
              <div
                key={network.name}
                className="reveal-on-scroll transition-all duration-500"
                style={{ transitionDelay: `${index * 100}ms` }}
                onClick={() => openSocial(network.url)}
              >
                <div className="bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-lg h-full">
                  <div className="relative mx-auto mb-6 w-20 h-20">
                    <div
                      className={`${network.color} rounded-full flex items-center justify-center w-20 h-20 transition-transform duration-300 hover:scale-105`}
                    >
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                  </div>

                  <h4 className="text-2xl font-bold text-white mb-2">{network.name}</h4>
                  <p className="text-gray-400 mb-4">{network.username}</p>

                  <div className="text-secondary font-medium inline-flex items-center gap-1">
                    Seguir
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RedesSociales;
