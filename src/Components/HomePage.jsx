
import React, { useEffect, useState } from "react";
import logo from "../assets/Images/Wings-icon 2.svg";
import Footerlogo from "../assets/Images/Wings-footer-1.svg";
import "./styles.css";
import { client, urlFor } from "../sanity/SainityClient";
import { PortableText } from '@portabletext/react';
import Lottie from "lottie-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import heroAnimation from "../assets/Images/Final-Top-Banner.json";


// React-friendly animated text component that splits a string into letter spans
function AnimatedText({ tag = 'span', text, className, delayIndex = 0, children }) {
  const Tag = tag;
  const ref = React.useRef(null);

  // choose string to render: prefer text prop, then children if it's a string
  const content = typeof text === 'string' ? text : (typeof children === 'string' ? children : null);

  React.useEffect(() => {
    // GSAP removed — no per-character animation. Characters render statically.
    // This effect intentionally left blank so AnimatedText simply renders character spans.
  }, [content, delayIndex]);

  if (content === null) {
    // not a simple string - render children as-is
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Tag className={className} ref={ref} aria-hidden={false}>
      {Array.from(content).map((ch, i) => (
        <span key={i} className="char">
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </Tag>
  );
}
const homeQuery = `
*[_type == "homePage"][0]{
  hero{
    smallLabel,
    heading,
    subText,
    video{
      asset->{
        _id,
        url
      }
    }
  },

  statement{
    largeText
  },

  projects{
    sectionTitle,
    description,
    projects[]->{
      _id,
      title,
      category,
      shortDescription,
      media{
        mediaType,
        image{
          asset->{
            _id,
            url
          }
        },
        video{
          asset->{
            _id,
            url
          }
        }
      }
    }
  },

  awards,

  services,

  trust{
    heading,
    founders[]->{
      _id,
      name,
      role,
      testimonial,
      photo{
        asset->{
          _id,
          url
        }
      }
    }
  },

  testimonials{
    heading,
    subheading,
    testimonials[]->{
      _id,
      name,
      designation,
      message,
      rating,
      photo{
        asset->{
          _id,
          url
        }
      }
    }
  },

  industries,

  cta{
    heading,
    subText,
    description,
    buttonText,
    buttonLink
  },

  news{
    sectionTitle,
    sectionHeading,
    newsItems[]->{
      _id,
      title,
      heading,
      description,
      publishedAt,
      image{
        asset->{
          _id,
          url
        }
      }
    }
  }
}
`;
export default function HomePage() {
  const [data, setData] = useState(null);

  // live timezone clocks for hero labels
  const [indiaTime, setIndiaTime] = useState("");
  const [usaTime, setUsaTime] = useState("");
  const [navOpen, setNavOpen] = useState(false);

  // slider state for testimonials
  const [index, setIndex] = useState(0);

  // safe reference to the testimonials array from fetched data
  const items = data?.testimonials?.testimonials || [];
  // group items into slides of two entries each
  const slides = React.useMemo(() => {
    const s = [];
    for (let i = 0; i < items.length; i += 2) {
      s.push(items.slice(i, i + 2));
    }
    return s;
  }, [items]);

  // current slide items (two columns: left large portrait, right smaller portrait + text)
  const currentSlide = slides[index] || [];
  const leftItem = currentSlide[0] || null;
  const rightItem = currentSlide[1] || null;

  const next = () => {
    setIndex((i) => Math.min(i + 1, Math.max(0, slides.length - 1)));
  };

  const prev = () => {
    setIndex((i) => Math.max(0, i - 1));
  };
  
const portableComponents = {
  types: {
    image: ({ value }) => {
      return (
        <img
          src={urlFor(value).width(60).url()}
          alt=""
          style={{
            display: "inline-block",
            width: "80px",
            verticalAlign: "middle",
            margin: "0 8px"
          }}
        />
      );
    }
  }
};
  useEffect(() => {
    client.fetch(homeQuery).then((res) => {
      setData(res);
    });
  }, []);

  // Letter-scrub interaction removed per user request.

  useEffect(() => {
  gsap.registerPlugin(ScrollTrigger);

  const headings = document.querySelectorAll(".scrub-heading");

  headings.forEach((heading) => {
    const chars = heading.querySelectorAll(".char");

    gsap.fromTo(
      chars,
      {
        opacity: 0.1,
        y: 40,
      },
      {
        opacity: 1,
        y: 0,
        stagger: 0.03,
        ease: "power2.out",
        scrollTrigger: {
          trigger: heading,
          start: "top 80%",
          end: "top 30%",
          scrub: true, // 🔥 this makes it scrub with scroll
        },
      }
    );
  });

  return () => {
    ScrollTrigger.getAll().forEach((t) => t.kill());
  };
}, [data]);

  // update clocks every 30 seconds
  useEffect(() => {
    const formatT = (timeZone, locale = "en-US") =>
      new Date().toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone,
      });
//potable text for statement section

    const update = () => {
      try {
        setIndiaTime(formatT("Asia/Kolkata", "en-IN"));
        setUsaTime(formatT("America/New_York", "en-US"));
      } catch (e) {
        // fallback to local time if timezone not supported
        const now = new Date();
        setIndiaTime(now.toLocaleTimeString());
        setUsaTime(now.toLocaleTimeString());
      }
    };

    update();
    const id = setInterval(update, 30 * 1000);
    return () => clearInterval(id);
  }, []);

  // GSAP-based testimonial animations removed per request.

  // GSAP-based generic heading animations removed per request.

  // Smooth scroll using Lenis (optional dependency). Provides slower, buttery scrolling.
  // To enable: run `npm install @studio-freight/lenis` in your project root.
  useEffect(() => {
    let rafId = null;
    let lenis = null;

    const initLenis = async () => {
      try {
        const module = await import('@studio-freight/lenis');
        const Lenis = module?.default || module;
        // Create Lenis instance with slower feel (duration controls scroll easing)
        lenis = new Lenis({
          duration: 1.6, // increase for slower feeling
          easing: (t) => Math.min(1, 1 - Math.pow(1 - t, 3)),
          smooth: true,
          direction: 'vertical',
          gestureDirection: 'vertical',
        });

        // RAF loop for Lenis
        const raf = (time) => {
          lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        };

        rafId = requestAnimationFrame(raf);

        // GSAP removed — no ticker synchronization.
      } catch (err) {
        // Lenis not installed: ignore silently but log so developer can install it
        // console.warn('Lenis not available. Install with: npm install @studio-freight/lenis');
      }
    };

    initLenis();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis && typeof lenis.destroy === 'function') lenis.destroy();
    };
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <>
      {/* HEADER - left links, centered logo, right CTA + mobile toggle */}
      <header className="site-header">
        <div className="site-inner">
          <nav className="left-nav">
            <a href="#what">//WHAT WE DO</a>
            <a href="#work">//WORK</a>
            <a href="#inside">//INSIDE WINGS</a>
          </nav>

          <div className="center-logo" aria-hidden="true">
            <div className="logo"><img src={logo} alt="" /></div>
          </div>

          <div className="right-nav">
            <a href="#contact" className="lets-talk">//LET'S TALK</a>

            <button
              className="mobile-toggle"
              aria-label="Menu"
              onClick={() => setNavOpen((s) => !s)}
            >
              <span className="burger" />
            </button>
          </div>
        </div>

        <div className={`mobile-nav ${navOpen ? "open" : ""}`}>
          <a href="#what" onClick={() => setNavOpen(false)}>//WHAT WE DO</a>
          <a href="#work" onClick={() => setNavOpen(false)}>//WORK</a>
          <a href="#inside" onClick={() => setNavOpen(false)}>//INSIDE WINGS</a>
          <a href="#contact" onClick={() => setNavOpen(false)}>//LET'S TALK</a>
        </div>
      </header>

      {/* HERO */}
      <section className="hero section">
        <div className="container">
          <div className="hero-wrap">
            {(data.hero?.illustration || heroAnimation) && (
              <div className="hero-bg-image" aria-hidden="true">
                <Lottie
                  animationData={heroAnimation}
                  loop={true}
                  autoplay={true}
                  className="hero-lottie"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            )}
            <div className="hero-content">
            <div className="span-wrapper">
             <span className="small-label" aria-live="polite" aria-atomic="true">
              {indiaTime ? `IND ${indiaTime}` : "IND --:--"}
             </span>
              <span className="small-label" aria-live="polite" aria-atomic="true">
              {usaTime ? `USA ${usaTime}` : "USA --:--"}
             </span>

             </div>
<AnimatedText
  tag="h1"
  className="here-h1 scrub-heading"
  text={data.hero?.heading}
/>          </div>
          </div>

        
        </div>
      </section>



    {/* full siz video */}
<section className="full section">
  {data.hero?.video?.asset?.url && (
    <video  autoPlay muted loop playsInline className="hero-video">
      <source src={data.hero.video.asset.url} type="video/mp4" />
    </video>
  )}
</section>

      {/* STATEMENT */}
     <section className="statement section">
  <div className="container">
    <h2 className="statement-heading">
      <PortableText
      className="statement-text"
        value={data.statement?.largeText}
        components={portableComponents}
      />
    </h2>
  </div>
</section>

      {/* PROJECTS */}
      <section className="projects section">
        <div className="container">
      <div className="projects-intro">
            <h3>{data.projects?.sectionTitle}</h3>
          <p className="project-description">{data.projects?.description}</p>
      </div>
          <div><p className="project-descriptions">/ recent Works</p></div>
          <div className="project-grid">
  {data.projects?.projects?.map((project, index) => {
    
    const isFullWidth = (index + 1) % 3 === 0;

    return (
      <div
        key={project._id}
        className={`project-card ${isFullWidth ? "full-width" : "half-width"}`}
      >
        {/* MEDIA RENDERING */}
        {project.media?.mediaType === "image" && project.media.image && (
          <img
            src={urlFor(project.media.image).width(1200).url()}
            alt={project.title}
          />
        )}

        {project.media?.mediaType === "video" && project.media.video && (
          <video
            autoPlay
            muted
            loop
            playsInline
            src={project.media.video.asset.url}
          />
        )}

        <div className="project-meta">
          <h4>{project.title}</h4>
          <p>{project.category}</p>
        </div>
      </div>
    );
  })}
</div> </div>
      </section>

      {/* AWARDS */}
      {/* <section className="awards section">
        <div className="container awards-grid">
          <div className="awards-text">
            <p className="project-descriptionS">{data.awards?.heading}</p>
            <h3>{data.awards?.description}</h3>
          </div>

          {data.awards?.awardImage && (
            <img
            className="solana-img"
              src={urlFor(data.awards.awardImage).url()}
              alt="Award"
            />
          )}
        </div>
      </section> */}

      {/* SERVICES */}
      {/* <section className="services section">
        <div className="container">
          <h3>{data.services?.introText}</h3>

          <ul className="services-list">
            {data.services?.services?.map((service, index) => (
              <li key={index}>{service.title}</li>
            ))}
          </ul>
        </div>
      </section> */}

      {/* TRUST */}
      {/* <section className="trust section">
        <div className="container">
          <h3>{data.trust?.heading}</h3>

          <div className="founders">
            {data.trust?.founders?.map((founder, index) => (
              <div key={index}>
                {founder.photo && (
                  <img
                    src={urlFor(founder.photo).width(120).url()}
                    alt={founder.name}
                  />
                )}
                <p>{founder.name}</p>
                <span>{founder.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section> */}
      {/* TESTIMONIALS - redesigned to match provided layout */}
    <section className="testimonials section">
       <div className="testimonial-head">
          <p className="testimonial-side">/WHAT DRIVES US</p>
          
        </div>
      <div className="container testimonial-inner">
       
<AnimatedText
  tag="h2"
  className="testimonial-heading scrub-heading"
  text="Over 270 founders have placed their trust in us"
/>
        <div className="testimonial-grid">
          <div className="testimonial-left">
            <div className="portrait large-portrait">
              {leftItem && leftItem.photo ? (
                <img src={urlFor(leftItem.photo).width(1200).url()} alt={leftItem.name} />
              ) : (
                <div className="placeholder" />
              )}
              <div className="portrait-overlay">{leftItem?.designation || leftItem?.name || 'Client'}</div>
            </div>

            <div className="testimonial-arrows">
              <button className="arrow-btn" onClick={prev} aria-label="previous">←</button>
              <button className="arrow-btn" onClick={next} aria-label="next">→</button>
            </div>
          </div>

          <div className="testimonial-right">
            <div className="right-top">
              <div className="portrait small-portrait">
                {rightItem && rightItem.photo ? (
                  <img src={urlFor(rightItem.photo).width(600).url()} alt={rightItem.name} />
                ) : (
                  <div className="placeholder small" />
                )}
                <div className="badge">{rightItem?.designation?.split(',')?.[1]?.trim() || ''}</div>
              </div>

              <div className="testimonial-text">
                <h4 className="testimonial-name">/ {rightItem?.name || ''}</h4>
                <small className="testimonial-role">{rightItem?.designation || 'designation'}</small>
                <p className="testimonial-quote">{rightItem?.message ? `"${rightItem.message}"` : ''}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* INDUSTRIES */}
      {/* <section className="industries section">
        <div className="container">
          <h3>{data.industries?.heading}</h3>

          <div className="industry-grid">
            {data.industries?.industries?.map((item, index) => (
              <span key={index}>{item}</span>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA */}
      <section className="section">
        <div className="cta-section container">
          <h5 className="title">{data.cta?.heading}</h5>
          <h2 className="cta-text">{data.cta?.subText}</h2>
          <p className="cts-description">{data.cta?.decription}</p>
          <a href={data.cta?.buttonLink}>
            <button className="cta-button">{data.cta?.buttonText}</button>
          </a>
        </div>
      </section>
      {/* NEWS SECTION */}
<section className="news section">
  <div className="container">
    <div className="news-header">
      <p className="news-small">{data.news?.sectionTitle}</p>
      <h2 className="news-title">{data.news?.sectionHeading}</h2>
    </div>

    <div className="news-grid">
      {data.news?.newsItems?.map((item) => (
        <div key={item._id} className="news-card">
          
          {item.image && (
            <img
              src={item.image.asset.url}
              alt={item.title}
              className="news-image"
            />
          )}

          <div className="news-content">
            <h4 className="news-small-title">{item.title}</h4>
         
    
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

<section className="section">
  <div className="container doit-container">
    <div className="do-it-once">
      <button><p>Do it once.Do it right</p><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 6H18M18 6V18M18 6L6 18" stroke="black" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>
    </div>
  </div>
</section>



    <footer className="wings-footer">
      <div className="wings-footer-inner ">
        <div className="wings-footer-left">
          <div className="footer-contacts">
            <div className="contact-block">
              <small className="muted">General questions</small>
              <a href="mailto:hello@wings.design" className="contact-link">hello@wings.design</a>
            </div>

            <div className="contact-block">
              <small className="muted">Business enquiries</small>
              <a href="mailto:partners@wings.design" className="contact-link">partners@wings.design</a>
            </div>

            <ul className="social-list">
              <li>Instagram</li>
              <li>LinkedIn</li>
              <li>Behance</li>
              <li>Medium</li>
            </ul>

            <div className="ai-row">
              <span>Ask AI about Wings</span>
              <span className="ai-icons" aria-hidden="true">⚙️ • ◦</span>
            </div>

            <div className="explore">Explore Services, Industries, Locations... <span className="arrow">↓</span></div>
          </div>
        </div>

        <div className="wings-footer-right">
          <div className="stripes" aria-hidden="true">
            {/* create the striped area with repeating linear gradient in CSS */}
            <img src={Footerlogo} alt="Wings" className="stripes-logo" />
          </div>

          <div className="right-caption">Creative Studio for<br/>Immersive Experience</div>

          <div className="copyright">© 2016—{new Date().getFullYear()} Tefiti</div>
        </div>
      </div>
    </footer>
    </>
  );
}
