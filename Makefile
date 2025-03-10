########################################################### 
#　Generic　makefile　 
#　 
#　by　George　Foot　 
#　email:　george.foot@merton.ox.ac.uk　 
#　 
#　Copyright　(c)　1997　George　Foot　 
#　All　rights　reserved.　 
#　保留所有版權　 
#　 
#　No　warranty,　no　liability;　 
#　you　use　this　at　your　own　risk.　 
#　沒保險，不負責　 
#　你要用這個，你自己擔風險　 
#　 
#　You　are　free　to　modify　and　 
#　distribute　this　without　giving　 
#　credit　to　the　original　author.　 
#　你可以隨便更改和散發這個文件　 
#　而不需要給原作者什榮譽。　 
#　（你好意思？）　 
#　 
###################################### 

###　Customising 
# 
#　Adjust　the　following　if　necessary;　EXECUTABLE　is　the　target 
#　executable's　filename,　and　LIBS　is　a　list　of　libraries　to　link　in 
#　(e.g.　alleg,　stdcx,　iostr,　etc).　You　can　override　these　on　make's 
#　command　line　of　course,　if　you　prefer　to　do　it　that　way. 
#　 
#　如果需要，調整下面的東西。　EXECUTABLE　是目標的可執行文件名，　LIBS 
#　是一個需要連接的程序包列表（例如　alleg,　stdcx,　iostr　等等）。當然你 
#　可以在　make　的命令行覆蓋它們，你願意就沒問題。 
#　 

EXECUTABLE　:=　test

LDOPTS =
LDDIRS = -L../../lib
LDLIBS = -lfreeglut -lglew32 -lopengl32 -lgdi32 -lwinmm

LIBS　 = $(LDOPTS) $(LDDIRS) $(LDLIBS)

#　Now　alter　any　implicit　rules'　variables　if　you　like,　e.g.: 
# 
#　現在來改變任何你想改動的隱含規則中的變量，例如 

CFLAGS　:=　-g　-Wall　-O3　-m486 
CXXFLAGS　:=　$(CFLAGS) 

#　The　next　bit　checks　to　see　whether　rm　is　in　your　djgpp　bin 
#　directory;　if　not　it　uses　del　instead,　but　this　can　cause　(harmless) 
#　`File　not　found'　error　messages.　If　you　are　not　using　DOS　at　all, 
#　set　the　variable　to　something　which　will　unquestioningly　remove 
#　files. 
# 
#　下面先檢查你的　djgpp　命令目錄下有沒有　rm　命令，如果沒有，我們使用 
#　del　命令來代替，但有可能給我們　'File　not　found'　這個錯誤信息，這沒 
#　什大礙。如果你不是用　DOS　，把它設定成一個刪文件而不廢話的命令。 
#　（其實這一步在　UNIX　類的系統上是多余的，只是方便　DOS　用戶。　UNIX 
#　用戶可以刪除這５行命令。） 

RM-F　:=　rm　-f 

#　You　shouldn't　need　to　change　anything　below　this　point. 
# 
#　從這裡開始，你應該不需要改動任何東西。（我是不太相信，太ＮＢ了！） 

SOURCE　:=　$(wildcard　*.c)　$(wildcard　*.cc) 
OBJS　:=　$(patsubst　%.c,%.o,$(patsubst　%.cc,%.o,$(SOURCE))) 
DEPS　:=　$(patsubst　%.o,%.d,$(OBJS)) 
MISSING_DEPS　:=　$(filter-out　$(wildcard　$(DEPS)),$(DEPS)) 
MISSING_DEPS_SOURCES　:=　$(wildcard　$(patsubst　%.d,%.c,$(MISSING_DEPS))　\ 
$(patsubst　%.d,%.cc,$(MISSING_DEPS))) 
CPPFLAGS　+=　-MD 

.PHONY　:　everything　deps　objs　clean　veryclean　rebuild 

everything　:　$(EXECUTABLE) 

deps　:　$(DEPS) 

objs　:　$(OBJS) 

clean　: 
　　@$(RM-F)　*.o 
　　@$(RM-F)　*.d 

veryclean:　clean 
　　@$(RM-F)　$(EXECUTABLE) 

rebuild:　veryclean　everything 

ifneq　($(MISSING_DEPS),) 
$(MISSING_DEPS)　: 
　　@$(RM-F)　$(patsubst　%.d,%.o,$@) 
endif 

-include　$(DEPS) 

$(EXECUTABLE)　:　$(OBJS) 
　　gcc　-o　$(EXECUTABLE)　$(OBJS)　$(addprefix　-l,$(LIBS)) 
###
