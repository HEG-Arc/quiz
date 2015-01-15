quiz
====

Local client to display quiz question and print scores

backend
python 2.7
PyYAML http://pyyaml.org/wiki/PyYAML

questions.yml
- first answer must be the correct one
- only one correct answer for each question


https://sites.google.com/site/pydatalog/python/pip-for-windows
pip install reportlab

config.cfg http://blogs.msdn.com/b/patricka/archive/2012/11/05/how-do-i-deploy-a-windows-8-app-to-another-device-for-testing.aspx
set adobe path and printer name,... to foxitreader better results
WARNING: download foxit version 6.x
Version 7.x opens a pdf file after printing, causing a server crash

http://www.foxitsoftware.com/Secure_PDF_Reader/

windows store app test
http://blogs.msdn.com/b/patricka/archive/2012/11/05/how-do-i-deploy-a-windows-8-app-to-another-device-for-testing.aspx

automatic logon
http://windows.microsoft.com/en-us/windows-vista/turn-on-automatic-logon

IMPORTANT !
http://msdn.microsoft.com/en-us/library/windows/apps/dn640582.aspx
checknetisolation loopbackexempt -a -n=<package family name>

http://msdn.microsoft.com/en-us/library/windows/desktop/jj835832(v=vs.85).aspx


Create self-signed key
MakeCert /n "CN=Haute Ecole Arc Gestion" /r /h 0 /eku "1.3.6.1.5.5.7.3.3,1.3.6.1.4.1.311.10.3.13" /e 12/31/2016 /sv MyKey.pvk MyKey.cer
Pvk2Pfx /pvk MyKey.pvk /pi pvkPassword /spc MyKey.cer /pfx MyKey.pfx
Certutil -addStore TrustedPeople MyKey.cer

http://technet.microsoft.com/library/hh852635.aspx

Check if licence activated with:
slmgr /dli

If not, activate licence for windows:

slmgr /ato

... and product:

slmgr /ipk <sideloading product key> = XQ6VW-H4NHD-XRDJV-C9M6K-H49V7
slmgr /ato ec67814b-30e6-4a50-bf7b-d55daf729d1e
HKEY_LOCAL_MACHINE\Software\Policies\Microsoft\Windows\Appx\AllowAllTrustedApps = 1

import-module appx
add-appxpackage Quiz_1.0.0.10_AnyCPU.appx


