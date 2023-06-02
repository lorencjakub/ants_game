from typing import *


WebTemplate = NewType("WebTemplate", object)

JsonDict = NewType("JsonDict", str)

JsonList = NewType("JsonDict", str)

CORSSettings = NewType("CORSSettings", Dict[str, Union[List[str], str]])

SecuritySettings = NewType("SecuritySettings", Dict[str, Union[List[str], str]])
