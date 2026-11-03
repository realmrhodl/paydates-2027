const R='/workspace/paydates-v2-concept';
module.exports={
  content:[R+'/*.html','!'+R+'/_old-dark-concept.html',R+'/assets/*.js','!'+R+'/assets/tw.js'],
  safelist:['grid-cols-1','grid-cols-2','grid-cols-3','sm:grid-cols-1','sm:grid-cols-2','sm:grid-cols-3','sm:grid-cols-4'], // pay.js: 'grid-cols-'+Math.min(3,n)
  theme:{extend:{
    colors:{
      pd:{DEFAULT:'#7351c0',header:'#6849ad',dark:'#5b3ba3',darker:'#462d7e',light:'#a089d4',lighter:'#cdc1e9',op:'rgba(115,81,192,.75)'},
      body:{DEFAULT:'#edf0f7',light:'#f8f9fc'},
      ink:{DEFAULT:'#343a40',muted:'#5d738d',soft:'#a1aebd'},
      line:'#dfe4f1', gold:'#EEBD22'
    },
    fontFamily:{sans:['Poppins','sans-serif']},
    borderRadius:{pill:'1.125rem'},
    boxShadow:{block:'0 1px 3px rgba(214,221,237,.5),0 1px 2px rgba(214,221,237,.5)',pill:'0 0 .875rem 0 #e3e4e5'}
  }}
};
