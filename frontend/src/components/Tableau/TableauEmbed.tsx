const TableauEmbed = () => {
  const url =
    'https://public.tableau.com/views/Unipath/Chung?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link:showVizHome=no&:embed=true';
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'white',
        border: '10px solid white',
      }}
    >
      <iframe title="Tableau Dashboard" width="85%" height="100%" src={url} style={{border: 'none'}} />
    </div>
  );
};

export default TableauEmbed;