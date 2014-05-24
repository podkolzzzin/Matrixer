var WIDTH = 800;
var HEIGHT = 420;
var MENU_HEIGHT;
var App=new Application();
var CHARS=new Array('x','y','z','a','b','c','d','e','f','g','h','i','k','l','p','k');
function Application()
{
    this.MATRIX_DEFENITER=0;
    this.EQUATION=1;
    this.SOLVE=2;
    this._isMatrixInitialized = false;
    this._matrixDisplayApplication;
    this._equationDisplayApplication=null;
    this._matrixMathApplication=new MathMatrixApplication();
    this._current;
    this._equationMathApplication=new MathEquationApplication();
    this.Activate=function(menuItem) {
        switch(menuItem)
        {
            case this.MATRIX_DEFENITER:
            {
                document.getElementById("buttonMatrix").style.backgroundColor="#545454";
                document.getElementById("buttonEquation").style.backgroundColor="#6c6c6c";
                this._onMatrixActivate();
                this._current=this._matrixDisplayApplication;
                break;
            }
            case this.EQUATION:
            {
                document.getElementById("buttonMatrix").style.backgroundColor="#6c6c6c";
                document.getElementById("buttonEquation").style.backgroundColor="#545454";
                this._onEquationActivate();
                this._current=this._equationDisplayApplication;
                break;
            }
            case this.SOLVE:
            {
                this._current.TryToSolve();
            }
        }
    }
    this.Add=function()
    {
        this._current.Add();
    }
    this._onMatrixActivate = function () {
        if (!this._isMatrixInitialized) {
            this._matrixDisplayApplication = new MatrixApplication(document.getElementById("matrixDefiner"));
            this._isMatrixInitialized = true;
        }
        this._matrixDisplayApplication.Work();
    }
    this._onEquationActivate=function()
    {
        if(this._equationDisplayApplication==null)
        {
            this._equationDisplayApplication=new EquationDisplayApplication(document.getElementById("equation"));
        }
    }
}
function EquationDisplayApplication(elem)
{
    this._element=elem;
    this._size=2;
    this._element.innerHTML+="<div><input type='text' class='numberInp' /> <span class='unknown'> &nbsp;"+CHARS[0]+" </span><span class='zero'>&nbsp;&nbsp;+&nbsp;&nbsp;</span><input  type='text' class='numberInp' /> <span class='unknown'> &nbsp;"+ CHARS[1] + " </span><span class='zero'>&nbsp;&nbsp;+&nbsp;&nbsp;</span><input  type='text' class='numberInp' /><span class='zero'> = 0</span></div>" +
            "<div><input type='text'  class='numberInp' /> <span class='unknown'> &nbsp;"+CHARS[0]+" </span><span class='zero'>&nbsp;&nbsp;+&nbsp;&nbsp;</span><input  type='text' class='numberInp' /> <span class='unknown'> &nbsp;"+ CHARS[1] + " </span><span class='zero'>&nbsp;&nbsp;+&nbsp;&nbsp;</span><input  type='text' class='numberInp' /><span class='zero'> = 0</span></div>";
    this.Add=function()
    {
        var elHTML="";
        this._size++;
        for(var i=0;i<this._size;i++)
        {
            elHTML+="<div>";
            for(var j=0;j<this._size;j++)
            {
                elHTML+="<input type='text' class='numberInp' /> <span class='unknown'> &nbsp;"+CHARS[j]+" </span><span class='zero'>&nbsp;&nbsp;+&nbsp;&nbsp;</span>";
            }
            elHTML+="<input  type='text' class='numberInp' /><span class='zero'> = 0</span></div>";
        }
        this._element.innerHTML=elHTML;
    }
    this.TryToSolve=function()
    {
        var matrix=new Array(this._size);
        var divs=this._element.getElementsByTagName('div');
        var inps;
        for(var i=0;i<this._size;i++)
        {
            matrix[i]=new Array(this._size);
            inps=divs[i].getElementsByTagName('input');
            for(var j=0;j<this._size+1;j++)
            {
                if(inps[j].value!="")
                    matrix[i][j]=parseFloat(inps[j].value);
                else
                    matrix[i][j]=0;
            }
        }
        App._equationMathApplication.Solve(matrix);
    }
}
function Delta(solution,result)
{
    this.Solution=solution;
    this.Result=result;
}
function MathEquationApplication()
{
    this._matrixSwapDelete=function(matrix,dest)
    {
        var newMatrix=new Array(matrix.length);
        var jj=0;
        for(var i=0;i<matrix.length;i++)
        {
            newMatrix[i]=new Array(matrix.length);
            for(var j=0;j<matrix.length;j++)
            {
                if(j==dest)
                {
                    newMatrix[i][j]=matrix[i][matrix[i].length-1];
                    continue;
                }
                newMatrix[i][j]=matrix[i][j];
            }
        }
        return newMatrix;
    }
    this.Solve=function(matrix)
    {
        var deltas=new Array(App._equationDisplayApplication._size);
        var tMatrix=this._matrixSwapDelete(matrix,-1);
        var delta=new Delta(App._matrixMathApplication.Solve(tMatrix,1),App._matrixMathApplication.GetResult(tMatrix,1));
        for(var i=0;i<deltas.length;i++)
        {
            tMatrix=this._matrixSwapDelete(matrix,i);
            deltas[i]=new Delta(App._matrixMathApplication.Solve(tMatrix,1),App._matrixMathApplication.GetResult(tMatrix,1));
        }
        this.ShowSolution(delta,deltas);
    }
    this._show=function(deltaName,solution,result,elem)
    {
            elem.innerHTML+="<div class='deltaSearch'><div class='rovno'>"+deltaName+"=</div>";
            elem.appendChild(solution.Show());
            elem.innerHTML+="<div class='rovno'>=</div>";
            var nextLevelChildren=solution.ArrayOfActions;
            var levelChildren;
            var allAreSimple=false;
            if(solution.ArrayOfActions==null && solution.Matrix==null)
            {
                elem.appendChild(solution.Show());
                return;
            }
            while(!allAreSimple)
            {
                allAreSimple=true;
                levelChildren=nextLevelChildren;
                nextLevelChildren=new Array();
                for(var i=0;i<levelChildren.length;i++)
                {
                    elem.appendChild(levelChildren[i].Show());
                    if(levelChildren[i].ArrayOfActions!=null && levelChildren[i].Matrix!=null)
                    {
                        allAreSimple=false;
                        for(var j=0;j<levelChildren[i].ArrayOfActions.length;j++)
                        {
                            nextLevelChildren.push(levelChildren[i].ArrayOfActions[j]);
                        }
                    }
                }
                elem.innerHTML+="<div class='rovno'>=</div>";
            }
            elem.innerHTML+="<div class='rovno'><b>"+result+"</b></div></div>";
    }
    this.ShowSolution=function(delta,deltas)
    {
        var levelChildren,allAreSimple=false;
        var elem=document.createElement("div");
        document.getElementById("solution").innerHTML="";
        document.getElementById("solution").appendChild(elem);
        this._show("&Delta;",delta.Solution,delta.Result,elem);
        for(var i=0;i<deltas.length;i++)
        {
            this._show("&Delta;"+CHARS[i],deltas[i].Solution,deltas[i].Result,elem)
        }

        for(var p=0;p<deltas.length;p++)
        {
            elem.innerHTML+="<div class='solutionFinal'>"+CHARS[p]+" = &Delta;"+CHARS[p]+"/&Delta; = "+(deltas[p].Result/delta.Result)+"</div>"
        }
    }
}
function SummandNode(matrix,k,actions)
{
    this.Matrix=matrix;
    this.K=k;
    this.ArrayOfActions=actions;
    this.Show=function()
    {
        var elem=document.createElement("span");
        elem.setAttribute("class","summandNode");
        var innerHTML="";
        innerHTML+="<table class='matrixTable";
        if(this.K==1)
            innerHTML+=" matrixTableLined" ;
        if(this.Matrix==null)
            innerHTML+=" matrixUnLined";
        innerHTML+="'>";
        if(this.K!=1)
        {
            if(this.Matrix!=null)
            {
                innerHTML+="<tr><td class='first' rowspan='"+(this.Matrix.length+1)+"'>";
            }
            else
            {
                innerHTML+="<tr><td class='last'>";
            }
            if(this.K>0) innerHTML+="+"+this.K;
            else innerHTML+=this.K;
            if(this.Matrix!=null)
            {
                innerHTML+=" * ";
            }
            innerHTML+="</td>";
        }
        if(this.Matrix!=null)
        {
            for(var i=0;i<this.Matrix.length;i++)
            {
                innerHTML+="<tr>";
                for(var j=0;j<this.Matrix.length;j++)
                {
                    innerHTML+="<td>"+this.Matrix[i][j];
                    if(j!=this.Matrix.length-1)
                        innerHTML+=",";
                    innerHTML+=" </td>";
                }
                innerHTML+="</tr>";
            }

        }
        innerHTML+="</table>";
        elem.innerHTML=innerHTML;
        return elem;
    }
}
function MathMatrixApplication()
{
    this._lastIsFree=function(elem,size)
    {
        var trs=elem.getElementsByTagName("tr");
        var mas=trs[size-1].getElementsByTagName("input");
        for(var i=0;i<mas.length;i++)
        {
            if(mas[i].value!='')
            {
                return false;
            }
        }
        for(var i=0;i<trs.length;i++)
        {
            if(trs[i].getElementsByTagName('input')[size-1].value!='')
            {
                return false;
            }
        }
        return true;
    }
    this._getSize=function()
    {
        var size=App._matrixDisplayApplication._size;
        while(this._lastIsFree(App._matrixDisplayApplication._element,size))
            size--;
        return size;
    }
    this.TryToSolve=function()
    {
       var tSize=this._getSize();
       var matrix=new Array();
       var trs=App._matrixDisplayApplication._element.getElementsByTagName('tr');
       var inps;
       for(var i=0;i<tSize;i++)
       {
           matrix.push(new Array());
           inps=trs[i].getElementsByTagName('input');
           for(var j=0;j<tSize;j++)
           {
               if(inps[j].value=='')
                matrix[i].push(0);
               else
                matrix[i].push(parseFloat(inps[j].value));
           }
       }
       var result=this.GetResult(matrix,1);
       var solution=this.Solve(matrix,1);
       App._matrixDisplayApplication.ShowSolution(solution,result);
    }
    this._matrixWithout=function(withoutId,matrix)
    {
        var newMatrix=new Array(matrix.length-1);
        var jj=0;
        for(var i=1;i<matrix.length;i++)
        {
            newMatrix[i-1]=new Array(matrix.length)
            jj=0;
            for(var j=0;j<matrix.length;j++)
            {
                if(j==withoutId)
                {
                    continue;
                }
                newMatrix[i-1][jj]=matrix[i][j];
                jj++;
            }
        }
        return newMatrix;
    }
    this.GetResult=function(matrix,k)
    {
        if(matrix.length==2)
        {
            return k*(matrix[0][0]*matrix[1][1]-matrix[0][1]*matrix[1][0]);
        }
        var znak=1,result=0;
        for(var i=0;i<matrix.length;i++)
        {
            result+=znak*this.GetResult(this._matrixWithout(i,matrix),matrix[0][i]);
            znak=-znak;
        }
        return result*k;
    }
    this.Solve=function(newMatrix,k)
    {
        if(newMatrix.length==2)
        {
            return new SummandNode(null,k*(newMatrix[0][0]*newMatrix[1][1]-newMatrix[0][1]*newMatrix[1][0]),null);
        }
        var myNode=new SummandNode(newMatrix,k,new Array());
        var znak=1;
        for(var i=0;i<newMatrix.length;i++)
        {
            myNode.ArrayOfActions.push(this.Solve(this._matrixWithout(i,newMatrix),znak*newMatrix[0][i]));
            znak=-znak;
        }
        return myNode;
    }
}
function MatrixApplication(parentNode) {
    this._element;
    this._size=2;
    this._initCol = function (num,isLast) {
        var td, inp;
        td = document.createElement("td");
        inp = document.createElement("input");
        var sizeH=(HEIGHT-95)/(parseInt(Math.sqrt(num)+1));
        var sizeW=(WIDTH)/parseInt(Math.sqrt(num)+1);
        inp.style.width=sizeW+"px";
        inp.style.height=sizeH+"px";
        inp.style.fontSize=parseInt(sizeH/1.2)+"px";
        td.appendChild(inp);
        return td;
    }
    this._size=2;
    this.Add=function()
    {
        this._onInpClick();
    }
    this.TryToSolve=function()
    {
        App._matrixMathApplication.TryToSolve();
    }
    this.ShowSolution=function(solution,result)
    {
        var levelChildren,nextLevelChildren=solution.ArrayOfActions,allAreSimple=false;
        var elem=document.createElement("div");
        document.getElementById("solution").innerHTML="";
        document.getElementById("solution").appendChild(elem);
        elem.appendChild(solution.Show());
        elem.innerHTML+="<div class='rovno'>=</div>";
        while(!allAreSimple)
        {
            allAreSimple=true;
            levelChildren=nextLevelChildren;
            nextLevelChildren=new Array();
            for(var i=0;i<levelChildren.length;i++)
            {
                elem.appendChild(levelChildren[i].Show());
                if(levelChildren[i].ArrayOfActions!=null && levelChildren[i].Matrix!=null)
                {
                    allAreSimple=false;
                    for(var j=0;j<levelChildren[i].ArrayOfActions.length;j++)
                    {
                        nextLevelChildren.push(levelChildren[i].ArrayOfActions[j]);
                    }
                }
            }
            elem.innerHTML+="<div class='rovno'>=</div>";
        }
        elem.innerHTML+="<div class='rovno'><b>"+result+"</b></div>";
    }
    this._onInpClick=function()
    {
        var trs=App._matrixDisplayApplication._element.getElementsByTagName('tr');
        var s=App._matrixDisplayApplication._size;
        var sizeH=(HEIGHT-95)/(s+2);
        var sizeW=WIDTH/(s+2);
        var j=0;
        var inps;
        for(var i=0;i<trs.length;i++)
        {
            inps=trs[i].getElementsByTagName("input");
            for(var j=0;j<inps.length;j++)
            {
                inps[j].style.width=sizeW+"px";
                inps[j].style.height=sizeH+"px";
                inps[j].style.fontSize=parseFloat(sizeH/1.2)+"px";
                inps[j].onclick=undefined;
                if(j==inps.length-1)
                {
                    trs[i].appendChild(App._matrixDisplayApplication._initCol((s+1)*(s+1),true));
                    break;
                }
            }
        }
        App._matrixDisplayApplication._size++;
        var tr=document.createElement("tr");
        for(var i=0;i<App._matrixDisplayApplication._size;i++)
        {
            tr.appendChild(App._matrixDisplayApplication._initCol((s+1)*(s+1),true));
        }
        App._matrixDisplayApplication._element.appendChild(tr);
    }
    this._show = function (parentNode) {
        this._element = document.createElement("table");
        var line;
        for (var i = 0; i < this._size; i++) {
            line = document.createElement("tr");
            for (var j = 0; j < this._size; j++) {
                    line.appendChild(this._initCol(this._size*this._size,(j==this._size-1 || i==this._size-1)));
            }
            this._element.appendChild(line);
        }
        parentNode.appendChild(this._element);
    }
    this._construct = function (parentNode) {
        this._show(parentNode);
    }
    this.Work = function () {

    }

    this._construct(parentNode);
}

function showWorkArea(el) {
    var t = document.getElementsByClassName("workArea");
    for (var i = 0; i < t.length; i++) {
        if (i == el) {
            t[i].style.display = "block";
        }
        else {
            t[i].style.display = "none";
        }

    }
    App.Activate(el);
}
function test(n)
{
   var matrix=new Array(n);
   for(var i=0;i<n;i++)
   {
       matrix[i]=new Array(n+1);
       for(var j=0;j<n;j++)
       {
           matrix[i][j]=parseInt(Math.random()*100);
       }
   }
    console.time('timer');
   var delta=App._matrixMathApplication.GetResult(App._equationMathApplication._matrixSwapDelete(matrix,-1),1);
   var deltas=new Array(n);
   for(var i=0;i<deltas.length;i++)
   {
       deltas[i]=App._matrixMathApplication.GetResult(App._equationMathApplication._matrixSwapDelete(matrix,i),1);
   }
   var str="";

   for(var i=0;i<deltas.length;i++)
   {
       str+=CHARS[i]+="="+delta/deltas[i]+"<br>";
   }
   console.timeEnd('timer');
   document.write(str);

}