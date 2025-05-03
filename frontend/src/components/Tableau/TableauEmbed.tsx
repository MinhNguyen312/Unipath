import { useEffect, useRef } from 'react';

const TableauEmbed = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';
    script.async = true;

    const vizContainer = containerRef.current;
    if (vizContainer) {
      vizContainer.innerHTML = `
        <div class='tableauPlaceholder' style='height: 100vh; width: 80%;'>
          <noscript>
            <a href='#'>
              <img alt='Dashboard' src='https://public.tableau.com/static/images/Un/Unipath/Chung/1.png' />
            </a>
          </noscript>
          <object class='tableauViz' style='width:100%; height:100%;'>
            <param name='host_url' value='https%3A%2F%2Fpublic.tableau.com%2F' />
            <param name='name' value='Unipath/Chung' />
            <param name='toolbar' value='yes' />
            <param name='tabs' value='no' />
            <param name='animate_transition' value='yes' />
            <param name='display_static_image' value='yes' />
            <param name='display_spinner' value='yes' />
            <param name='display_overlay' value='yes' />
            <param name='display_count' value='yes' />
            <param name='language' value='en-US' />
          </object>
        </div>
      `;

      vizContainer.appendChild(script);
    }

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}
    />
  );
};




export default TableauEmbed;
